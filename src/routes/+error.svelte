<script>
	import { page } from '$app/stores'

	let error = $page.error

	if(!$page.route.id) {
		error = {
			message: "Not Found",
        	description: "The requested URL was not found on this server."
		}
	}

	// if (!$page.error?.description && $page.error?.message == 'Not Found') {
	// 	message = 'The requested URL was not found on this server.'
	// }
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">{error?.message || ''}</h1>
			<p class="py-6">
				{error?.description || ''}
			</p>
		</div>
	</div>
</div>
