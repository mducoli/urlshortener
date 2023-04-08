import { authenticate } from '$lib/server/auth';
import { PremadeError } from '$lib/server/errors';
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

// TODO
const handleAuth = (async ({ event, resolve }) => {

	if (event.url.pathname == '/dashboard') {

		if(!event.platform?.env?.APP_SECRET) {
			throw PremadeError.ENVMISS
		}

		if (await authenticate(event.url.searchParams.get('token'), event.platform.env.APP_SECRET)) {
			return new Response('', {
				headers: {
					'Set-Cookie': 'token=' + event.url.searchParams.get('token'),
					Location: '/dashboard'
				},
				status: 302
			});
		}

		if (await authenticate(event.cookies.get('token'), event.platform.env.APP_SECRET)) {
			event.locals.authenticated = true;
			return resolve(event);
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
