<script lang="ts">
	import Icon from 'svelte-fa';
	import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
	export let href: string;
	export let target: string | undefined = undefined;
</script>

<a {href} {target} class="text-secondary flex"
	><slot /><Icon icon={faArrowUpRightFromSquare} class="my-auto ml-2" />
</a>
