import { fromByteArray, toByteArray } from 'base64-js'

export const base64 = {
	encode: (string: string) => {
		return fromByteArray(new TextEncoder().encode(string))
	},
	decode: (base64: string) => {
		return new TextDecoder().decode(toByteArray(base64))
	}
}
