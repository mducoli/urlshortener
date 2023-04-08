import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

// TODO
const handleAuth = (async ({ event, resolve }) => {
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

// export const handleError = (({ error, event }) => {
// 	console.log(error)
// 	if (!event.route.id) {
// 		return {
// 			message: 'Not Found',
// 			description: 'The requested URL was not found on this server.'
// 		}
// 	}
// }) satisfies HandleServerError
