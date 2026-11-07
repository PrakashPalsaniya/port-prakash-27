import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { profile, projects, skillGroups, timeline, languages, stats } from './data'

function Icon({ name = 'arrow', size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 19 19 5M5 5h14v14" /></>,
    right: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
    down: <><path d="M12 4v16m-6-6 6 6 6-6" /></>,
    code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" /></>,
    layers: <><path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5" /></>,
    cpu: <><rect x="7" y="7" width="10" height="10" rx="2" /><rect x="10" y="10" width="4" height="4" rx=".5" /><path d="M9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    cloud: <><path d="M7 18a5 5 0 1 1 0-10 6 6 0 0 1 11-1 5.5 5.5 0 0 1 0 11H7Z" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" /></>,
    moon: <path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>
}

function ExternalLink({ href, children, className = '', ...props }) {
  return <a href={href} target="_blank" rel="noreferrer" className={className} {...props}>{children}</a>
}

function ArcReactor() {
  return <image className="reactor-image" href="/images/arc-reactor-cyan.webp" x="137" y="130" width="206" height="206" />
}

function SystemVisual() {
  return <div className="system-visual" role="img" aria-label="An Iron Man-inspired arc reactor with polished silver supports, glowing cyan light rings, and a white core connected to reliable APIs, useful AI, and data systems.">
    <div className="system-top"><span><i className="status-dot" /> SYSTEM THINKING</span><span>FIG. 001</span></div>
    <div className="system-grid" />
    <svg className="system-wires" viewBox="0 0 480 470" aria-hidden="true">
      <circle cx="240" cy="233" r="153" className="orbit" />
      <circle cx="240" cy="233" r="114" className="orbit orbit-inner" />
      <path d="M100 115H158L208 200M350 108v62l-81 45M122 345h50l39-77M349 343v-59l-79-30" className="wire" />
      <path d="M100 115H158L208 200M350 108v62l-81 45M122 345h50l39-77M349 343v-59l-79-30" className="wire-flow" />
      <ArcReactor />
      <circle cx="87" cy="233" r="4" className="satellite" />
      <circle cx="393" cy="233" r="4" className="satellite" />
    </svg>
    <div className="system-node node-api"><div><Icon name="code" /><span>01 / BACKEND</span></div><strong>Reliable APIs</strong><small>Built for the real world</small></div>
    <div className="system-node node-ai"><div><Icon name="cpu" /><span>02 / INTELLIGENCE</span></div><strong>Useful AI</strong><small>Context → clarity</small></div>
    <div className="system-node node-data"><div><Icon name="database" /><span>03 / DATA</span></div><strong>Connected systems</strong><small>Every piece, in sync</small></div>
    <span className="core-caption">THE ENGINEER'S MINDSET</span>
    <div className="system-bottom"><span className="system-coordinates">34.0837° N / 74.7973° E</span><span>Ideas. Connected.<Icon name="cpu" size={16} /></span></div>
  </div>
}

function SectionHeading({ number, label, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow"><span>{number}</span> {label}</p><h2>{title}</h2></div>{children}</div>
}

const projectNotes = {
  documind: { label: 'FROM DOCUMENTS TO ANSWERS', title: 'Knowledge, unlocked.', icon: 'cpu', tags: ['Agentic RAG', 'Hybrid retrieval', 'SSE streaming'] },
  finmate: { label: 'A LITTLE MORE FINANCIAL CLARITY', title: 'Make sense of spending.', icon: 'layers', tags: ['Gemini AI', 'Redis caching', 'Telegram bot'] },
  screenly: { label: 'EVERY SEAT. IN REAL TIME.', title: 'The next show starts here.', icon: 'layers', tags: ['Live seat sync', 'Safe payments', 'Event queues'] },
  pklinks: { label: 'SMALL LINKS. BIG ARCHITECTURE.', title: 'Short links, built to scale.', icon: 'code', tags: ['6 microservices', 'Cached redirects', 'Async analytics'] },
}

function ProjectCard({ project, index, onOpen }) {
  const note = projectNotes[project.id]
  return <article className={`project-row project-${project.id}`}>
    <button className="project-preview" onClick={() => onOpen(project)} aria-label={`Read ${project.name} case study`}>
      <div className="preview-heading"><span>{note.label}</span><Icon name={note.icon} size={22} /></div>
      <p className="preview-title">{note.title}</p>
      <div className="browser-frame"><div className="browser-toolbar"><div><i /><i /><i /></div><span>{new URL(project.links.demo).hostname}</span><Icon name="arrow" size={12} /></div><img src={project.preview.src} alt={project.preview.alt} width="1280" height="720" loading="lazy" decoding="async" /></div>
      <div className="preview-footer"><span>{project.category}</span><span>EXPLORE PROJECT <Icon name="arrow" size={15} /></span></div>
    </button>
    <div className="project-info"><div className="project-meta"><span>PROJECT / 0{index + 1}</span><span>{project.year}</span></div><h3>{project.name}<span className="project-title-dot">.</span></h3><p className="project-tagline">{project.tagline}</p><p className="project-summary">{project.story.contribution}</p><div className="tags">{note.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="project-actions"><button className="text-link" onClick={() => onOpen(project)}>Behind the build <Icon name="right" /></button><ExternalLink className="icon-link" href={project.links.demo} aria-label={`Open ${project.name} live demo`}><Icon /></ExternalLink><ExternalLink className="icon-link" href={project.links.code} aria-label={`View ${project.name} source code`}><Icon name="code" /></ExternalLink></div></div>
  </article>
}

function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null)
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    dialog.querySelector('button')?.focus({ preventScroll: true })
    return () => { dialog.close(); document.body.style.overflow = overflow; if (opener?.isConnected) opener.focus({ preventScroll: true }) }
  }, [])
  const handleBackdrop = event => {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
  }
  return createPortal(<dialog ref={dialogRef} className={`case-dialog project-${project.id}`} aria-labelledby="case-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={handleBackdrop}>
    <div className="case-top"><span className="eyebrow">THE THINKING BEHIND THE BUILD</span><button className="icon-link" onClick={onClose} aria-label="Close project details"><Icon name="close" /></button></div>
    <div className="case-intro"><span className="eyebrow">{project.category} / {project.year}</span><h2 id="case-title">{project.name}<span>.</span></h2><p>{project.tagline}</p></div>
    <img className="case-image" src={project.preview.src} alt={project.preview.alt} width="1280" height="720" />
    <div className="case-body"><p className="case-description">{project.description}</p><div className="case-story">{[['01', 'The problem', project.story.problem], ['02', 'What I built', project.story.contribution], ['03', 'The outcome', project.story.result]].map(([n, label, text]) => <section key={n}><span className="eyebrow">{n} / {label}</span><p>{text}</p></section>)}</div>
      <h3>Under the hood</h3><div className="architecture">{[['Request flow', project.architecture.flow], ['Background work', project.architecture.async], ['Services & storage', project.architecture.stores]].map(([label, nodes]) => <div className="architecture-row" key={label}><span>{label}</span><div>{nodes.map((node, index) => <div className="architecture-step" key={node}><b>{node}</b>{index < nodes.length - 1 && <Icon name="right" size={16} />}</div>)}</div></div>)}</div>
      <h3>Implementation details</h3><ul className="case-highlights">{project.highlights.map(item => <li key={item}><Icon name="check" size={18} /><span>{item}</span></li>)}</ul>
      <div className="case-metrics">{project.metrics.map(metric => <div key={metric.k}><strong>{metric.k}</strong><span>{metric.v}</span></div>)}</div>
      <h3>The stack</h3><div className="tags">{project.stack.map(item => <span key={item}>{item}</span>)}</div><div className="case-links"><ExternalLink className="button button-primary" href={project.links.demo}>Visit live project <Icon /></ExternalLink><ExternalLink className="button button-outline" href={project.links.code}>View source <Icon name="code" /></ExternalLink></div>
    </div>
  </dialog>, document.body)
}

function LocalTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()))
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [])
  return <span>{time} IST</span>
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copyEmail = async () => {
    clearTimeout(timer.current)
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setMessage('Email address copied.') }
    catch { setMessage('You can select the email address to copy it, or click it to open your email app.') }
    timer.current = setTimeout(() => { setCopied(false); setMessage('') }, 5000)
  }
  return <section id="contact" className="contact-section section-wrap" aria-labelledby="contact-title"><div className="contact-top"><p className="eyebrow"><span>04</span> WHAT'S NEXT</p><span className="availability"><i className="status-dot" /> OPEN TO OPPORTUNITIES</span></div><h2 id="contact-title">Good things start<br />with a <em>conversation.</em><a className="contact-big-arrow" href={`mailto:${profile.email}`} aria-label="Start a conversation by email"><Icon size={72} /></a></h2><div className="contact-bottom"><div><p>Have a role, an idea, or a good problem?</p><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="icon-link" onClick={copyEmail} aria-label={copied ? 'Email copied' : 'Copy email address'}><Icon name={copied ? 'check' : 'copy'} size={18} /></button></div><p className="copy-status" role="status">{message}</p></div><div className="contact-details"><a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a><span><Icon name="pin" size={15} /> {profile.location} · Open to remote</span></div></div><div className="contact-socials"><ExternalLink href={profile.github}>GitHub <Icon size={16} /></ExternalLink><ExternalLink href={profile.linkedin}>LinkedIn <Icon size={16} /></ExternalLink><a href={profile.resume} download>Resume <Icon name="download" size={16} /></a></div></section>
}

export default function App({ initialYear = new Date().getFullYear() }) {
  const [filter, setFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [themeLoaded, setThemeLoaded] = useState(false)
  const [year, setYear] = useState(initialYear)
  const progressRef = useRef(null)
  const headerRef = useRef(null)
  const menuToggleRef = useRef(null)
  useEffect(() => {
    try { setTheme(localStorage.getItem('studio-theme') === 'dark' ? 'dark' : 'light') } catch { /* Keep the default theme if storage is unavailable. */ }
    setThemeLoaded(true)
    setYear(new Date().getFullYear())
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101827' : '#f4f7fb')
    if (themeLoaded) try { localStorage.setItem('studio-theme', theme) } catch { /* Theme still works without storage. */ }
  }, [theme, themeLoaded])
  useEffect(() => {
    let frame = null
    const update = () => { frame = null; const total = document.documentElement.scrollHeight - innerHeight; if (progressRef.current) progressRef.current.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})` }
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); if (frame) cancelAnimationFrame(frame) }
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const closeOutside = event => { if (!headerRef.current?.contains(event.target)) setMenuOpen(false) }
    const closeEscape = event => {
      if (event.key === 'Escape') { setMenuOpen(false); menuToggleRef.current?.focus() }
    }
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); window.removeEventListener('keydown', closeEscape) }
  }, [menuOpen])
  useEffect(() => {
    const desktop = matchMedia('(min-width: 651px)')
    const close = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener('change', close)
    return () => desktop.removeEventListener('change', close)
  }, [])
  const visibleProjects = projects.filter(project => filter === 'all' || (filter === 'ai' ? ['documind', 'finmate'].includes(project.id) : ['screenly', 'pklinks'].includes(project.id)))
  return <>
    <a className="skip-link" href="#main">Skip to content</a><div className="scroll-progress" ref={progressRef} />
    <header ref={headerRef} className="site-header">
      <a className="brand" href="#top" aria-label="Prakash Palsaniya, back to top" onClick={() => setMenuOpen(false)}>
        <img className="brand-avatar" src={profile.navbarAvatar} alt="" width="42" height="42" decoding="async" />
        <span>Prakash<br />Palsaniya<span className="brand-period">.</span></span>
      </a>
      <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">{[['work', 'Work'], ['expertise', 'Expertise'], ['about', 'About']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let's talk <Icon size={16} /></a></nav>
      <div className="header-controls"><button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><button ref={menuToggleRef} className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button></div>
    </header>
    <main id="main"><section id="top" className="hero section-wrap" aria-labelledby="hero-title"><div className="hero-topline"><p className="eyebrow"><span className="eyebrow-code-mark" aria-hidden="true"><Icon name="code" size={22} /></span> ENGINEERING WITH INTENTION</p><span className="hero-location">SRINAGAR, INDIA <span className="location-divider">/</span> <LocalTime /></span></div><div className="hero-grid"><div className="hero-copy"><div className="availability"><i className="status-dot" /> OPEN TO SDE & BACKEND INTERNSHIPS</div><h1 id="hero-title"><span className="hero-name">{profile.name}</span>Built to work.<br />Made to<br /><em>matter.</em><span className="hero-code-mark" aria-hidden="true"><Icon name="code" size={54} /></span></h1><p className="hero-description">I'm Prakash — a backend & AI engineer.<br /> I turn complex problems into reliable systems<br className="desktop-break" /> and AI that makes itself useful.</p><div className="hero-actions"><a className="button button-primary" href="#work">Explore my work <Icon name="arrow" size={18} /></a><a className="resume-link" href={profile.resume} download>Get my Resume <Icon name="download" size={16} /></a></div></div><div className="hero-art"><SystemVisual /><div className="hero-art-note"><span className="art-note-copy">Less noise. More purpose.</span><span className="art-note-line" /><span>BACKEND × AI × SYSTEMS</span></div></div></div><div className="hero-bottom"><a href="#about" className="hero-person"><img src={profile.avatar} alt={profile.fullName} width="44" height="44" /><div><strong>Curious mind. Builder at heart.</strong><span>IT @ NIT Srinagar · Class of 2027</span></div></a><div className="hero-facts"><div><strong>04</strong><span>PROJECTS SHIPPED</span></div><div><strong>500+</strong><span>DSA PROBLEMS SOLVED</span></div><div><strong>8.4</strong><span>CGPA</span></div></div><a className="scroll-cue" href="#work" aria-label="Scroll to selected work"><Icon name="down" size={18} /></a></div></section>
      <section id="work" className="work-section section-wrap" aria-labelledby="work-title"><SectionHeading number="01" label="SELECTED WORK" title={<span id="work-title">Ideas into <em>impact.</em></span>}><p>Four different problems.<br />One drive to build things that work.</p></SectionHeading><div className="work-toolbar"><div className="project-filters" role="group" aria-label="Filter projects">{[['all', 'All projects', '04'], ['ai', 'AI & intelligence', '02'], ['systems', 'Backend & systems', '02']].map(([id, label, count]) => <button key={id} className={filter === id ? 'active' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}<span>{count}</span></button>)}</div><span className="work-index" aria-live="polite">{String(visibleProjects.length).padStart(2, '0')} PROJECTS / 2025</span></div><div className="project-list">{visibleProjects.map(project => <ProjectCard key={project.id} project={project} index={projects.indexOf(project)} onOpen={setSelectedProject} />)}</div><ExternalLink className="all-code-link" href={profile.github}>More code, experiments, and late-night commits on GitHub <Icon size={18} /></ExternalLink></section>
      <section id="expertise" className="expertise-section" aria-labelledby="expertise-title"><div className="section-wrap"><SectionHeading number="02" label="MY TOOLKIT" title={<span id="expertise-title">The right tools.<br /><em>The whole picture.</em></span>}><p>From the first request to the last response,<br />I care about what happens in between.</p></SectionHeading><div className="expertise-focus"><span><i className="status-dot" /> {stats[0].value}</span><span><Icon name="cpu" size={15} /> {stats[1].value}</span></div><div className="skills-grid">{skillGroups.map((group, index) => <article className="skill-group" key={group.title}><div className="skill-header"><Icon name={['cpu', 'code', 'database', 'cloud', 'layers'][index]} size={27} /><span>0{index + 1}</span></div><h3>{group.title === 'Agentic / AI' ? 'AI & intelligence' : group.title}</h3><div className="skill-items">{group.items.map(item => <span key={item}>{item}</span>)}</div></article>)}<div className="toolkit-note"><span className="toolkit-code-mark" aria-hidden="true"><Icon name="code" size={68} /></span><p>Tools change.<br />Good fundamentals<br /><em>stay with you.</em></p><span>ALWAYS LEARNING. ALWAYS BUILDING.</span></div></div></div></section>
      <section id="about" className="about-section section-wrap" aria-labelledby="about-title"><SectionHeading number="03" label="THE HUMAN BEHIND THE CODE" title={<span id="about-title">A little more <em>Prakash.</em></span>} /><div className="about-grid"><div className="about-portrait"><div className="portrait-image"><img src={profile.avatar} alt="Prakash Chand Palsaniya" width="600" height="600" loading="lazy" /><span className="portrait-sticker">STILL<br />CURIOUS.<span aria-hidden="true">↗</span></span></div><div className="portrait-caption"><span>PRAKASH CHAND PALSANIYA</span><span>BUILDER / LEARNER</span></div></div><div className="about-copy"><p className="about-lead">I like understanding how things work.<br /><em>Then making them work better.</em></p><p>{profile.bio}</p><p className="about-tagline">{profile.tagline}</p><div className="education-card"><span className="eyebrow">CURRENTLY AT</span><h3>{profile.education.school}</h3><div><span>{profile.education.degree}</span><span>{profile.education.detail}</span></div></div><div className="language-card"><span className="eyebrow">THE LANGUAGES I THINK IN</span><div className="language-bar" aria-hidden="true">{languages.map(language => <span key={language.name} style={{ width: `${language.pct}%`, background: language.color }} />)}</div><div className="language-legend">{languages.map(language => <span key={language.name}><i style={{ background: language.color }} />{language.name} <b>{language.pct}%</b></span>)}</div></div></div></div><div className="journey"><div className="journey-label"><span className="eyebrow">THE JOURNEY SO FAR</span><Icon name="right" size={22} /></div><div className="timeline">{timeline.map(item => <article key={item.when}><span className="timeline-year">{item.when}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
      <Contact />
    </main><footer className="site-footer section-wrap"><a className="footer-name" href="#top">Prakash Palsaniya<span>.</span></a><span>© {year} · Thoughtfully engineered.</span><a className="back-top" href="#top">Back to top <Icon name="down" size={15} /></a></footer>
    {selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
  </>
}
