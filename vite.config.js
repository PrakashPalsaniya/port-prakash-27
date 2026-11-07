import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { seoPlugin } from './seo.config.js'

function prerenderPlugin() {
  let config
  return {
    name: 'portfolio-prerender',
    apply: 'build',
    configResolved(value) { config = value },
    async closeBundle() {
      if (config.build.ssr || config.build.watch) return
      const cacheRoot = path.join(config.root, '.cache')
      await mkdir(cacheRoot, { recursive: true })
      const serverOutput = await mkdtemp(path.join(cacheRoot, 'prerender-'))
      try {
        await build({
          root: config.root,
          configFile: config.configFile,
          logLevel: 'warn',
          build: {
            ssr: path.join(config.root, 'src/entry-server.jsx'),
            outDir: serverOutput,
            copyPublicDir: false,
            emptyOutDir: false,
            rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
          },
        })
        const { render } = await import(pathToFileURL(path.join(serverOutput, 'entry-server.mjs')).href)
        const year = new Date().getFullYear()
        const indexPath = path.resolve(config.root, config.build.outDir, 'index.html')
        const template = await readFile(indexPath, 'utf8')
        const placeholder = '<div id="root"></div>'
        if (!template.includes(placeholder)) throw new Error('Could not find the root element to prerender.')
        await writeFile(indexPath, template.replace(placeholder, `<div id="root" data-build-year="${year}">${render(year)}</div>`))
        console.log('Prerendered portfolio content into index.html.')
      } finally {
        const cachePath = await realpath(cacheRoot)
        const outputPath = await realpath(serverOutput)
        const relative = path.relative(cachePath, outputPath)
        if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Refusing to remove a path outside the prerender cache.')
        await rm(outputPath, { recursive: true, force: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), seoPlugin(), prerenderPlugin()],
  resolve: { dedupe: ['react', 'react-dom'] },
})
