export function initClarity() {
  const projectId = (import.meta.env.VITE_CLARITY_PROJECT_ID ?? 'zae8rwrfj9').trim()

  if (!import.meta.env.PROD || !projectId || window.clarity) return

  window.clarity = function (...args) {
    window.clarity.q = window.clarity.q || []
    window.clarity.q.push(args)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`
  document.head.appendChild(script)
}
