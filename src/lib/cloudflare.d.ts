declare interface CFCache {
	default: CFCacheObject
	open: (cacheName: string) => Promise<CFCacheObject>
}

declare interface CFCacheObject {
	put: (request: string | Request, response: Response) => Promise<undefined>
	match: (
		request: string | Request,
		options?: { ignoreMethod?: boolean }
	) => Promise<Response | undefined>
	delete: (request: string | Request, options?: { ignoreMethod?: boolean }) => Promise<boolean>
}
