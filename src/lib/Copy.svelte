<script lang="ts">
	import Icon from 'svelte-fa'
	import { faCopy } from '@fortawesome/free-solid-svg-icons'

	let tooltip_open = false
	let force_open = false
	export let value: string

	function copy() {
		navigator.clipboard.writeText(value)
		tooltip_open = true
		force_open = true
		setTimeout(() => {
			force_open = false
		}, 1000)
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex cursor-pointer"
	class:tooltip={tooltip_open || force_open}
	class:tooltip-open={force_open}
	on:click={copy}
	on:mouseleave={() => {
		tooltip_open = false
	}}
	data-tip="Copied"
>
	<slot /><Icon icon={faCopy} class="my-auto ml-2" />
</div>
