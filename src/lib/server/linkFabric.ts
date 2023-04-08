import { z } from 'zod'
import { makeid } from './makeid'

export const LinkFabric = z.object({
	id: z
		.string()
		.regex(/^[a-zA-Z0-9_-]{6,30}$/, { message: 'Invalid ID' })
		.default(makeid(6)),
	created_at: z
		.date()
		.optional()
		.transform((v) => (v ? v : new Date())),
	title: z.string().optional(),
	long_url: z
		.string()
		.startsWith('http', { message: 'Invalid URL' })
		.url({ message: 'Invalid URL' }),
	hidden: z.boolean().default(false)
})
