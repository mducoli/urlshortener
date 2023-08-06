import { dev } from '$app/environment'
import { authenticate } from '$lib/server/auth'
import { PremadeError } from '$lib/server/errors'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

// https://github.com/ghostdevv/short/blob/e8962d83547ce0915b9e8ab801cf06a440973ee3/src/hooks.server.ts
async function kv(name: string) {
	const { FileStorage } = await import('@miniflare/storage-file')
	const { KVNamespace: KV } = await import('@miniflare/kv')

	// TODO: this uses the v2 api (not v3) so it's not 100% compatible (remove "as unknown")
	return new KV(new FileStorage(`./.mf/${name}`)) as unknown as KVNamespace
}

const handleAuth = (async ({ event, resolve }) => {
	// mock env for vite dev server
	if (dev) {
		event.platform ??= {
			env: {
				APP_SECRET: 'secret',
				DATA: await kv('DATA')
			}
		}
	}

	if (event.url.pathname == '/dashboard') {
		if (!event.platform?.env?.APP_SECRET) {
			throw PremadeError.ENVMISS
		}

		if (await authenticate(event.url.searchParams.get('token'), event.platform.env.APP_SECRET)) {
			return new Response('', {
				headers: {
					'Set-Cookie': 'token=' + event.url.searchParams.get('token'),
					Location: '/dashboard'
				},
				status: 302
			})
		}

		if (await authenticate(event.cookies.get('token'), event.platform.env.APP_SECRET)) {
			event.locals.authenticated = true
			return resolve(event)
		}
	}

	return resolve(event)
}) satisfies Handle

const handleCache = (async ({ event, resolve }) => {
	if (typeof caches == 'undefined') {
		return resolve(event)
	}

	const cache = await caches.open('maincache')

	// HIT
	const cached = await cache.match(event.request)
	if (cached) console.log('CACHE HIT')
	if (cached) return cached

	// MISS
	const response = await resolve(event)
	if (response.headers.has('cache-control')) {
		cache.put(event.request, response.clone())
	}

	return response
}) satisfies Handle

export const handle = sequence(handleAuth, handleCache)
