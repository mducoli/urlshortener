import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { KVFast } from '$lib/server/db'
import type { Link } from '$lib/types'
import { PremadeError } from '$lib/server/errors'

export const load = (async ({ params, setHeaders, platform }) => {
	if (!platform?.env?.DATA) throw PremadeError.ENVMISS

	const db = new KVFast<Link>(platform.env.DATA, 'link')
	const data = await db.get(params.shortid)

	if (data?.long_url) {
		setHeaders({
			'Cache-Control': 'public, max-age=31536000, immutable'
		})
		throw redirect(301, data.long_url)
	}

	throw PremadeError.NOTFOUND
}) satisfies PageServerLoad
