import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { wedding } from './src/config/wedding.js'
import { dateLabel, icsContent } from './src/utils/event.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// يملأ عنوان الصفحة ووصفها وصورة المعاينة من wedding.js، وينشئ ملف التقويم /wedding.ics
function invitation() {
  const site = (process.env.SITE_URL || wedding.siteUrl || '').replace(/\/+$/, '')
  const values = {
    APP_TITLE: `دعوة زفاف — ${wedding.bride} و${wedding.groom}`,
    APP_DESC: [wedding.subtitle, dateLabel(), wedding.venueCity].filter(Boolean).join(' — '),
    SITE_URL: site,
  }
  return {
    name: 'wedding-invitation',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/%(APP_TITLE|APP_DESC|SITE_URL)%/g, (_, k) => esc(values[k])),
    },
    configureServer(server) {
      server.middlewares.use('/wedding.ics', (_req, res) => {
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        res.end(icsContent())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'wedding.ics', source: icsContent() })
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), invitation()],
  build: { chunkSizeWarningLimit: 1000 },
})
