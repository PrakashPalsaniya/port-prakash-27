import { profile } from './src/data.js'

export const seo = {
  siteUrl: 'https://prakashpalsaniya.vercel.app/',
  title: 'Prakash Palsaniya | Backend & AI Engineer',
  description: 'Prakash Palsaniya is a backend & AI engineer and IT student at NIT Srinagar, building agentic RAG applications, microservices, and scalable APIs.',
  googleVerification: '02HoJCx-Q0pMH9C6RxnTbTzmVzT9jAllwt0SCGtjRV0',
}

export function normalizeSiteUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('VITE_SITE_URL must be a public HTTPS homepage URL, such as https://prakashpalsaniya.vercel.app/.')
  }
  return `${url.origin}/`
}

export function createSeo(siteUrl = seo.siteUrl) {
  const url = normalizeSiteUrl(siteUrl)
  const absolute = path => new URL(path, url).href
  const personId = `${url}#person`
  const websiteId = `${url}#website`
  const pageId = `${url}#profile`
  const image = absolute('/og-image.png')
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        alternateName: [profile.fullName, profile.username],
        url,
        image: absolute(profile.avatar),
        jobTitle: profile.role,
        description: seo.description,
        email: profile.email,
        sameAs: [profile.github, profile.linkedin],
        affiliation: { '@type': 'CollegeOrUniversity', name: profile.education.school },
        address: { '@type': 'PostalAddress', addressLocality: 'Srinagar', addressCountry: 'IN' },
        knowsAbout: ['Backend Engineering', 'AI Engineering', 'Agentic RAG', 'Node.js', 'LangGraph', 'Microservices', 'Distributed Systems', 'Databases'],
        mainEntityOfPage: { '@id': pageId },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url,
        name: `${profile.name} — Official Portfolio`,
        alternateName: profile.fullName,
        description: seo.description,
        inLanguage: 'en-IN',
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': pageId,
        url,
        name: seo.title,
        description: seo.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        primaryImageOfPage: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
      },
    ],
  }
  const meta = (name, content) => ({ tag: 'meta', attrs: { name, content }, injectTo: 'head' })
  const og = (property, content) => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' })
  return {
    siteUrl: url,
    tags: [
      { tag: 'title', children: seo.title, injectTo: 'head' },
      meta('description', seo.description),
      meta('author', profile.fullName),
      meta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
      meta('google-site-verification', seo.googleVerification),
      { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
      og('og:title', seo.title),
      og('og:description', seo.description),
      og('og:type', 'website'),
      og('og:url', url),
      og('og:site_name', profile.name),
      og('og:locale', 'en_IN'),
      og('og:image', image),
      og('og:image:type', 'image/png'),
      og('og:image:width', '1200'),
      og('og:image:height', '630'),
      og('og:image:alt', `${profile.name} — ${profile.role}`),
      meta('twitter:card', 'summary_large_image'),
      meta('twitter:title', seo.title),
      meta('twitter:description', seo.description),
      meta('twitter:image', image),
      meta('twitter:image:alt', `${profile.name} — ${profile.role}`),
      { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema).replaceAll('<', '\\u003c'), injectTo: 'head' },
    ],
    robots: `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`,
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url.replaceAll('&', '&amp;')}</loc></url>\n</urlset>\n`,
  }
}

export function seoPlugin() {
  let metadata
  let serverBuild = false
  return {
    name: 'portfolio-seo',
    configResolved(config) {
      metadata = createSeo(config.env.VITE_SITE_URL || seo.siteUrl)
      serverBuild = Boolean(config.build.ssr)
    },
    transformIndexHtml() { return metadata.tags },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url || '/', 'http://localhost').pathname
        if (!['/robots.txt', '/sitemap.xml'].includes(path)) return next()
        response.setHeader('Content-Type', path === '/robots.txt' ? 'text/plain; charset=utf-8' : 'application/xml; charset=utf-8')
        response.end(path === '/robots.txt' ? metadata.robots : metadata.sitemap)
      })
    },
    generateBundle() {
      if (serverBuild) return
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: metadata.robots })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: metadata.sitemap })
    },
  }
}
