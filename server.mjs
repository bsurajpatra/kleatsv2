// Custom Next.js server to run frontend on HTTPS :443 and HTTP :80 (redirect to HTTPS)
// Backend remains on :3000.

import fs from 'fs'
import http from 'http'
import https from 'https'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'

// Create Next app (do not bind a port; we'll attach the handler to our servers)
const app = next({ dev, hostname })
const handle = app.getRequestHandler()

// SSL cert paths (Let’s Encrypt)
const CERT_KEY_PATH = process.env.SSL_KEY_PATH || '/etc/letsencrypt/live/kleats.in/privkey.pem'
const CERT_FULLCHAIN_PATH = process.env.SSL_CERT_PATH || '/etc/letsencrypt/live/kleats.in/fullchain.pem'

// Helper: Redirect HTTP -> HTTPS
function createHttpRedirectServer() {
	return http.createServer((req, res) => {
		// Preserve host and path
		const host = req.headers.host?.split(':')[0] || 'kleats.in'
		const location = `https://${host}${req.url || ''}`
		res.writeHead(301, { Location: location })
		res.end()
	})
}

// Start servers
app.prepare().then(() => {
	// 1) Start HTTP server for redirect
	const httpServer = createHttpRedirectServer()
	httpServer.listen(80, hostname, () => {
		console.log('[HTTP] Listening on :80 (redirecting to HTTPS)')
	})

	// 2) Start HTTPS server for the Next app
	let credentials
	try {
		const key = fs.readFileSync(CERT_KEY_PATH, 'utf8')
		const cert = fs.readFileSync(CERT_FULLCHAIN_PATH, 'utf8')
		credentials = { key, cert }
	} catch (err) {
		console.error('[HTTPS] Failed to read SSL certificates:', err?.message || err)
		console.error(`[HTTPS] Ensure certs exist at:\n  key:  ${CERT_KEY_PATH}\n  cert: ${CERT_FULLCHAIN_PATH}`)
		process.exit(1)
	}

	const httpsServer = https.createServer(credentials, (req, res) => {
		// Hand off to Next request handler
		handle(req, res)
	})

	httpsServer.listen(443, hostname, () => {
		console.log('[HTTPS] Next.js app listening on :443')
	})
}).catch((err) => {
	console.error('Failed to prepare Next app:', err)
	process.exit(1)
})

