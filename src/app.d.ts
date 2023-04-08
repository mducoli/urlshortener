// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
/// <reference types="@cloudflare/workers-types"/>

declare global {
	namespace App {
		interface Error {
			description?: string
		}
		interface Locals {
			authenticated?: boolean
		}
		// interface PageData {}
		interface Platform {
			env?: {
				DATA?: KVNamespace
				APP_SECRET?: string
			}
		}
	}
}

export {}
