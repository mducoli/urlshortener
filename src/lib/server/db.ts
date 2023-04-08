import { parse, stringify } from 'superjson'
import { base64 } from './base64'

type PartialArray<T> =
	| {
			values: T[]
			list_complete: false
			cursor: string
	  }
	| {
			values: T[]
			list_complete: true
	  }

export class KVFast<V> {
	private ns: KVNamespace
	private prefix: string

	constructor(namespace: KVNamespace, prefix: string) {
		this.ns = namespace
		this.prefix = prefix
	}

	async get(key: string): Promise<V | undefined> {
		// GET DATA
		const x = await this.ns.getWithMetadata(this.prefix + '_' + key)
		if (x.value === null) {
			return undefined
		}
		const mtd = x.metadata as
			| undefined
			| {
					fast_data?: string
			  }

		// CHECK METADATA
		if (!mtd || !mtd.fast_data) {
			return undefined
		}

		// DECODE
		const raw = base64.decode(mtd.fast_data)

		// PARSE
		let parsed
		try {
			parsed = parse(raw)
		} catch (e) {
			return undefined
		}

		return parsed as V
	}

	async put(key: string, value: V) {
		const r_key = 'link_' + key
		const r_metadata = {
			fast_data: base64.encode(stringify(value))
		}
		await this.ns.put(r_key, 'fast_object', {
			metadata: r_metadata
		})

		return
	}

	async list(options?: {
		prefix?: string
		limit?: number
		cursor?: string
	}): Promise<PartialArray<V>> {
		const raw = await this.ns.list(options)

		const res = {
			...raw,
			values: [] as V[]
		}

		for (const key of raw.keys) {
			const mtd = key.metadata as undefined | { fast_data: string }

			if (!mtd || !mtd.fast_data) {
				console.warn(`Metadata not found (key: ${key.name})`)
				continue
			}

			// PARSE METADATA
			const raw = base64.decode(mtd.fast_data)
			let parsed
			try {
				parsed = parse(raw)
			} catch (e) {
				console.warn(`Metadata invalid JSON (key: ${key.name})\ndata: ${raw}`)
				continue
			}

			res.values.push(parsed as V)
		}

		return res
	}
}
