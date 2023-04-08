import { verify } from '@tsndr/cloudflare-worker-jwt'

export async function authenticate(
	token: string | undefined | null,
	secret: string
): Promise<boolean> {
	return new Promise((resolve) => {
		if (!token) {
			resolve(false)
			return
		}

		verify(token, secret)
			.then((v) => {
				resolve(v)
			})
			.catch(() => {
				resolve(false)
			})
	})
}
