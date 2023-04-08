import type { PageServerLoad } from './$types'
import { error, redirect } from '@sveltejs/kit'
import { KVFast } from '$lib/server/db'
import type { Link } from '$lib/types'

export const load = (async ({ params, setHeaders, platform }) => {
	if (!platform?.env?.DATA) {
		throw error(500, {
			message: 'Internal Server Error',
			description: 'Missing environment variables'
		})
	}

	const db = new KVFast<Link>(platform.env.DATA, 'link')
	const data = await db.get(params.shortid)

	if (data?.long_url) {
		setHeaders({
			'Cache-Control': 'public, max-age=31536000, immutable'
		})
		throw redirect(301, data.long_url)
	}

	throw error(404, {
		message: 'Not Found',
		description: 'The requested Short URL could not be found by the server.'
	})
}) satisfies PageServerLoad
