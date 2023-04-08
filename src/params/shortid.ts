import type { ParamMatcher } from '@sveltejs/kit'

export const match = ((param) => {
	return /^[a-zA-Z0-9_-]{6,30}$/.test(param)
}) satisfies ParamMatcher
