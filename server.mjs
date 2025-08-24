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

// Cashfree webhook reverse-proxy settings
// Incoming (frontend HTTPS):   POST https://<FRONTEND>/cashfree/webhook
// Forward to backend (origin): POST http://<BACKEND_HOST>:<PORT>/cashfree/webhook
const CASHFREE_WEBHOOK_PATH = process.env.CASHFREE_WEBHOOK_PATH || '/cashfree/webhook'
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || process.env.API_BASE_URL || 'http://127.0.0.1:3000'
const ENABLE_SERVER_WEBHOOK_PROXY = String(process.env.ENABLE_SERVER_WEBHOOK_PROXY || '').toLowerCase() === 'true'

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
		// Reverse-proxy Cashfree webhook as a raw byte stream before Next handles anything
		try {
			const method = req.method || 'GET'
			const url = req.url || '/'
			const pathname = url.split('?')[0]
			if (ENABLE_SERVER_WEBHOOK_PROXY && method === 'POST' && pathname === CASHFREE_WEBHOOK_PATH) {
				// Parse backend origin
				let target
				try { target = new URL(BACKEND_ORIGIN) } catch (e) {
					console.error('[Webhook] Invalid BACKEND_ORIGIN:', BACKEND_ORIGIN)
					res.statusCode = 500
					res.end('Invalid backend origin')
					return
				}
				const backendProtocol = target.protocol === 'https:' ? https : http
				const query = url.includes('?') ? `?${url.split('?')[1]}` : ''
				const options = {
					protocol: target.protocol,
					hostname: target.hostname,
					port: target.port || (target.protocol === 'https:' ? 443 : 80),
					method: 'POST',
					path: CASHFREE_WEBHOOK_PATH + query,
					headers: {
						// Preserve all incoming headers, especially signatures and content-type/length
						...req.headers,
						// Set Host to backend host to avoid upstream virtual-host issues
						host: target.host,
					},
				}
				const proxyReq = backendProtocol.request(options, (proxyRes) => {
					// Mirror status and headers back to client
					res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
					proxyRes.pipe(res)
				})
				proxyReq.on('error', (err) => {
					console.error('[Webhook] Proxy error:', err?.message || err)
					if (!res.headersSent) res.writeHead(502)
					res.end('Bad gateway')
				})
				// Stream raw bytes from the client to backend; no buffering, no parsing
				req.pipe(proxyReq)
				return // do not hand off to Next
			}
		} catch (e) {
			console.error('[HTTPS] Handler error:', e)
		}

		// Hand off all other requests to Next
		handle(req, res)
	})

	httpsServer.listen(443, hostname, () => {
		console.log('[HTTPS] Next.js app listening on :443')
	})
}).catch((err) => {
	console.error('Failed to prepare Next app:', err)
	process.exit(1)
})

