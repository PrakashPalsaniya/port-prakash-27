import { createContext, useContext, useEffect, useRef, useState } from 'react'

const MotionContext = createContext({ enabled: true, reduced: false, paused: false, toggle: () => {} })
const preferenceKey = 'prakash-portfolio-motion-paused'

export function MotionProvider({ children }) {
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReduced(preference.matches)
    const syncVisibility = () => setHidden(document.hidden)
    try { setPaused(sessionStorage.getItem(preferenceKey) === 'true') } catch { /* Storage can be unavailable in private browsing. */ }
    syncPreference()
    syncVisibility()
    preference.addEventListener('change', syncPreference)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      preference.removeEventListener('change', syncPreference)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  const toggle = () => {
    const next = !paused
    setPaused(next)
    try { sessionStorage.setItem(preferenceKey, String(next)) } catch { /* The switch still works without persistence. */ }
  }
  const enabled = !paused && !reduced

  return <MotionContext.Provider value={{ enabled, reduced, paused, toggle }}>
    <div className="portfolio-experience" data-motion={enabled ? 'on' : 'off'} data-page-hidden={hidden}>
      {children}
    </div>
  </MotionContext.Provider>
}

export const useMotion = () => useContext(MotionContext)

export function MotionToggle() {
  const { enabled, reduced, toggle } = useMotion()
  return <button className="motion-toggle" type="button" onClick={toggle} disabled={reduced}
    aria-label="Pause animations" aria-pressed={!enabled}
    title={reduced ? 'Motion is reduced by your device settings' : enabled ? 'Pause decorative animations' : 'Resume decorative animations'}>
    <span className="motion-bars" aria-hidden="true"><i /><i /><i /><i /></span>
    <span>Motion {enabled ? 'on' : 'off'}</span>
  </button>
}

// Content is visible in server-rendered HTML. Only the mounted observer opts it into a reveal.
export function Reveal({ as: Tag = 'div', children, delay = 0, className = '', style, ...props }) {
  const ref = useRef(null)
  const revealed = useRef(false)
  const { enabled } = useMotion()

  useEffect(() => {
    const element = ref.current
    if (!enabled || revealed.current || !('IntersectionObserver' in window)) {
      element.dataset.reveal = 'visible'
      revealed.current = true
      return
    }
    element.dataset.reveal = 'pending'
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      element.dataset.reveal = 'visible'
      revealed.current = true
      observer.disconnect()
    }, { threshold: 0.06, rootMargin: '0px 0px -28px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled])

  return <Tag ref={ref} className={'reveal ' + className} style={{ '--reveal-delay': delay + 'ms', ...style }} {...props}>{children}</Tag>
}

export function MotionRegion({ children, className = '', ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => { element.dataset.inView = String(entry.isIntersecting) })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={'motion-region ' + className} {...props}>{children}</div>
}

// Keep the hit area still; transform only the layers inside it. Work is coalesced into one frame.
export function usePointerLight(ref) {
  const { enabled } = useMotion()
  useEffect(() => {
    const element = ref.current
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = null
    let position = null
    const paint = () => {
      frame = null
      if (!position) return
      element.style.setProperty('--light-x', position.x + 'px')
      element.style.setProperty('--light-y', position.y + 'px')
      element.style.setProperty('--tilt-x', position.nx.toFixed(3))
      element.style.setProperty('--tilt-y', position.ny.toFixed(3))
    }
    const reset = () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
      position = null
      element.dataset.pointed = 'false'
      element.style.setProperty('--tilt-x', '0')
      element.style.setProperty('--tilt-y', '0')
    }
    const move = event => {
      if (!enabled || !pointer.matches || event.pointerType !== 'mouse' || document.hidden) return
      const bounds = element.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      position = { x, y, nx: Math.max(-1, Math.min(1, x / bounds.width * 2 - 1)), ny: Math.max(-1, Math.min(1, y / bounds.height * 2 - 1)) }
      element.dataset.pointed = 'true'
      if (frame === null) frame = requestAnimationFrame(paint)
    }
    reset()
    if (!enabled) return
    element.addEventListener('pointermove', move, { passive: true })
    element.addEventListener('pointerleave', reset)
    element.addEventListener('pointercancel', reset)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    pointer.addEventListener('change', reset)
    return () => {
      reset()
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', reset)
      element.removeEventListener('pointercancel', reset)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      pointer.removeEventListener('change', reset)
    }
  }, [enabled, ref])
}

export function MagneticLink({ children, className = '', ...props }) {
  const ref = useRef(null)
  usePointerLight(ref)
  return <a ref={ref} className={'magnetic-button ' + className} {...props}><span className="button-content">{children}</span></a>
}

export function AnimatedNumber({ value, decimals = 0, pad = 0, suffix = '' }) {
  const ref = useRef(null)
  const completed = useRef(false)
  const { enabled } = useMotion()
  const finalValue = value.toFixed(decimals).padStart(pad, '0') + suffix

  useEffect(() => {
    const element = ref.current
    let frame = null
    const finish = () => { element.textContent = finalValue }
    if (!enabled || completed.current || !('IntersectionObserver' in window)) { finish(); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      completed.current = true
      const start = performance.now()
      const animate = now => {
        const progress = Math.min((now - start) / 1300, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        element.textContent = (value * eased).toFixed(decimals).padStart(pad, '0') + suffix
        if (progress < 1 && !document.hidden) frame = requestAnimationFrame(animate)
        else finish()
      }
      frame = requestAnimationFrame(animate)
    }, { threshold: 0.5 })
    observer.observe(element)
    return () => { observer.disconnect(); if (frame !== null) cancelAnimationFrame(frame); finish() }
  }, [enabled, value, decimals, pad, suffix, finalValue])

  return <strong className="metric-number"><span className="sr-only">{finalValue}</span><span ref={ref} aria-hidden="true">{finalValue}</span></strong>
}

export function TechRibbon() {
  const tools = ['Node.js', 'LangGraph', 'PostgreSQL', 'Redis', 'AWS', 'RabbitMQ']
  return <MotionRegion className="tech-ribbon" aria-label={'Tools I build with: ' + tools.join(', ')}>
    <div className="tech-ribbon-inner section-wrap">
      <span className="ribbon-label">IDEAS INTO<br /><b>WORKING SYSTEMS</b></span>
      <div className="ribbon-window" aria-hidden="true"><div className="ribbon-track">
        {[0, 1].map(copy => <div className="ribbon-group" key={copy}>{tools.map(tool => <span key={tool}><i />{tool}</span>)}</div>)}
      </div></div>
    </div>
  </MotionRegion>
}
