import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

export function handoffPlugin(): Plugin {
  let annotationsPath: string

  return {
    name: 'handoff-context',
    configResolved(config) {
      annotationsPath = path.resolve(config.root, 'public', 'handoff-annotations.json')
      if (!fs.existsSync(annotationsPath)) {
        fs.mkdirSync(path.dirname(annotationsPath), { recursive: true })
        fs.writeFileSync(annotationsPath, JSON.stringify({ pins: [] }, null, 2))
      }
    },
    configureServer(server) {
      server.middlewares.use('/handoff-annotations', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('X-Handoff-Context', '1')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.setHeader('Access-Control-Expose-Headers', 'X-Handoff-Context')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          const data = fs.existsSync(annotationsPath)
            ? fs.readFileSync(annotationsPath, 'utf-8')
            : JSON.stringify({ pins: [] })
          res.end(data)
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(annotationsPath, JSON.stringify(parsed, null, 2))
              res.statusCode = 200
              res.end(JSON.stringify({ ok: true }))
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end()
      })
    },
  }
}
