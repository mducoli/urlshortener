<script lang="ts">
	import Copy from '$lib/components/Copy.svelte'
	import Link from '$lib/components/Link.svelte'
	import Icon from 'svelte-fa'
	import { faEdit, faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { fade, fly, scale } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import type { PageData, ActionData, SubmitFunction } from './$types'
	import type { Link as dLink } from '$lib/types'

	export let data: PageData
	export let form: ActionData

	let error = {
		show: false,
		message: ''
	}

	$: {
		if (form) {
			if (form.error == undefined) {
				error.show = false
				error.message = ''

				switch (form.action) {
					// CREATE ACTION
					case 'create': {
						data.urls = [form.created, ...data.urls]
						break
					}
					// UPDATE ACTION
					case 'update': {
						const updated: dLink = form.updated
						data.urls = data.urls.map((e) => {
							if (e.id == updated.id) return updated
							return e
						})
						break
					}
					default:
						break
				}
			} else {
				error.show = true
				error.message = form.error
			}
		}
	}

	let show_hidden_link = false
	let base_url = $page.url.host

	// modals
	let info_modal = {
		dialog: undefined as unknown as HTMLDialogElement,
		data: undefined as undefined | dLink
	}
	let edit_modal = {
		dialog: undefined as unknown as HTMLDialogElement,
		data: undefined as undefined | dLink,
		user_data: {
			_shortid: '',
			new_title: ''
		}
	}
	let hide_modal = {
		dialog: undefined as unknown as HTMLDialogElement,
		data: undefined as undefined | dLink,
		user_data: {
			_shortid: ''
		}
	}
	let show_modal = {
		dialog: undefined as unknown as HTMLDialogElement,
		data: undefined as undefined | dLink,
		user_data: {
			_shortid: ''
		}
	}

	// CREATE FORM
	let create_form: {
		loading: boolean
		handle: SubmitFunction
	} = {
		loading: false,
		handle: () => {
			create_form.loading = true

			return async ({ update }) => {
				await update()
				create_form.loading = false
			}
		}
	}

	//EDIT FORM
	let edit_form: {
		loading: boolean
		handle: SubmitFunction
	} = {
		loading: false,
		handle: () => {
			edit_form.loading = true

			return async ({ result, update }) => {
				await update({ reset: false })
				edit_form.loading = false

				if (result.type == 'success') {
					if (result.data?.action == 'update') {
						info_modal.data = result.data.updated
						edit_modal.dialog.close()
					}
				}
			}
		}
	}

	// HIDE_FORM
	let hide_form: {
		loading: boolean
		handle: SubmitFunction
	} = {
		loading: false,
		handle: () => {
			hide_form.loading = true

			return async ({ result, update }) => {
				await update({ reset: false })
				hide_form.loading = false

				if (result.type == 'success') {
					hide_modal.dialog.close()
					info_modal.dialog.close()
				}
			}
		}
	}

	// SHOW FORM
	let show_form: {
		loading: boolean
		handle: SubmitFunction
	} = {
		loading: false,
		handle: () => {
			show_form.loading = true

			return async ({ result, update }) => {
				await update({ reset: false })
				show_form.loading = false

				if (result.type == 'success') {
					show_modal.dialog.close()
					info_modal.dialog.close()
				}
			}
		}
	}

	// PREVENT SPAMMING
	let show_hidden_link_last_change: Date = new Date(new Date().getTime() - 600)
	$: {
		if (new Date().getTime() - show_hidden_link_last_change.getTime() < 500) {
			show_hidden_link = !show_hidden_link
		} else {
			show_hidden_link_last_change = new Date()
		}
	}
</script>

<svelte:head>
	<title>Dashboard - URL Shortener</title>
</svelte:head>

<div class="container m-auto py-6">
	<!-- Input -->
	<div class="flex flex-wrap">
		<form
			action="?/create"
			method="post"
			use:enhance={create_form.handle}
			class="flex flex-wrap grow"
		>
			<!-- URL input -->
			<div class="form-control w-full max-w-md">
				<label class="label" for="">
					<span class="label-text">URL</span>
				</label>
				<input
					type="url"
					name="url"
					placeholder="https://example.com/longurlthatyouwanttoshortener"
					class="input input-bordered w-full max-w-md"
					required
					disabled={create_form.loading}
				/>
			</div>
			<!-- id input -->
			<div class="form-control ml-6">
				<label class="label" for="">
					<span class="label-text">Short</span>
				</label>
				<label class="input-group">
					<span>{base_url}/</span>
					<input
						type="text"
						name="id"
						placeholder="empty for random"
						class="input input-bordered"
						pattern={String.raw`^[a-zA-Z0-9_-]{6,30}$`}
						disabled={create_form.loading}
					/>
				</label>
			</div>
			<!-- Submit button -->
			<button class="btn btn-primary mt-auto ml-6" class:loading={create_form.loading}
				>Create</button
			>
		</form>
		<!-- toggle hidden -->
		<div class="tooltip tooltip-left mt-auto ml-auto" data-tip="Show hidden links">
			<input type="checkbox" class="toggle" bind:checked={show_hidden_link} />
		</div>
	</div>

	{#if error.show}
		<div class="alert alert-error flex mt-6" transition:scale={{ duration: 150 }}>
			<div class="flex mr-auto">
				<div class="my-auto mr-2">
					<Icon icon={faCircleExclamation} />
				</div>
				<span>{error.message}</span>
			</div>
			<div>
				<button
					class="btn btn-sm btn-ghost"
					on:click={() => {
						error.show = false
					}}><Icon icon={faXmark} /></button
				>
			</div>
		</div>
	{/if}

	<!-- Table -->
	<div class="overflow-x-auto mt-6">
		<table class="table w-full">
			<!-- head -->
			<thead>
				<tr class="bg-base-200 text-base-content">
					<th>TITLE</th>
					<th>URL</th>
					<th>DATE</th>
					<th />
				</tr>
			</thead>

			<tbody class="text-base">
				<!-- rows -->
				{#each data.urls.filter((e) => (show_hidden_link ? e.hidden : !e.hidden)) as url (url.id)}
					<tr animate:flip in:fade out:fly={{ x: 100 }}>
						<td class="overflow-hidden" style="max-width: 1px;"
							><div>{url.title || url.long_url}</div></td
						>
						<td style="width: 1px;"
							><div>
								<Copy value={$page.url.protocol + '//' + base_url + '/' + url.id}
									>{base_url}/{url.id}</Copy
								>
							</div></td
						>
						<td style="width: 1px;"
							><div>
								{url.created_at.toLocaleDateString('it-it', {
									year: 'numeric',
									month: 'numeric',
									day: 'numeric'
								})}
							</div></td
						>
						<td style="width: 1px;"
							><div>
								<button
									class="btn btn-ghost btn-xs"
									on:click={() => {
										info_modal.data = url
										info_modal.dialog.showModal()
									}}>details</button
								>
							</div></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Details Modal -->

<dialog class="modal" bind:this={info_modal.dialog}>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
	<label for="" class="modal-box relative w-11/12 max-w-7xl">
		<h3 class="text-lg font-bold">Link details</h3>
		<div class="py-4" style="word-break: break-all;">
			<b>Title</b>
			<div class="flex">
				<span>{info_modal.data?.title || info_modal.data?.long_url}</span>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="my-auto ml-2 cursor-pointer"
					on:click={() => {
						edit_modal.user_data.new_title =
							info_modal.data?.title || info_modal.data?.long_url || ''
						edit_modal.user_data._shortid = info_modal.data?.id || ''
						edit_modal.data = info_modal.data
						edit_modal.dialog.showModal()
					}}
				>
					<Icon icon={faEdit} />
				</div>
			</div>
			<br />
			<b>Long URL</b>
			<Link href={info_modal.data?.long_url + ''} target="_blank">{info_modal.data?.long_url}</Link>
			<br />
			<b>Short URL</b>
			<Link href={$page.url.protocol + '//' + base_url + '/' + info_modal.data?.id} target="_blank"
				>{$page.url.protocol}//{base_url}/{info_modal.data?.id}</Link
			>
			<br />
			{#if !info_modal.data?.hidden}
				<button
					class="btn btn-error"
					on:click={() => {
						hide_modal.user_data._shortid = info_modal.data?.id || ''
						hide_modal.data = info_modal.data
						hide_modal.dialog.showModal()
					}}>Hide link</button
				>
			{:else}
				<button
					class="btn btn-success"
					on:click={() => {
						show_modal.user_data._shortid = info_modal.data?.id || ''
						show_modal.data = info_modal.data
						show_modal.dialog.showModal()
					}}>Show link</button
				>
			{/if}
		</div>
	</label>
</dialog>

<!-- Edit Modal -->

<dialog class="modal" bind:this={edit_modal.dialog}>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
	<label class="modal-box relative w-11/12 max-w-7xl" for="">
		<h3 class="text-lg font-bold w-full">Edit link title</h3>
		<p class="py-4">The title is only visible to you</p>
		<form action="?/edittitle" method="post" use:enhance={edit_form.handle}>
			<input
				type="text"
				bind:value={edit_modal.user_data.new_title}
				placeholder={edit_modal.data?.title || edit_modal.data?.long_url}
				class="input input-bordered w-full mb-4"
				name="title"
			/>
			<input type="text" hidden bind:value={edit_modal.user_data._shortid} name="shortid" />
			<div class="btn-group float-right">
				<button
					type="button"
					class="btn"
					on:click={() => {
						edit_modal.dialog.close()
					}}>Cancel</button
				>
				<button
					type="submit"
					class="btn btn-success"
					disabled={edit_modal.user_data.new_title == '' ||
						edit_modal.user_data.new_title == (edit_modal.data?.title || edit_modal.data?.long_url)}
					class:loading={edit_form.loading}>Edit</button
				>
			</div>
		</form>
	</label>
</dialog>

<!-- Hide Modal -->

<dialog class="modal" bind:this={hide_modal.dialog}>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
	<label class="modal-box relative" for="">
		<h3 class="text-lg font-bold">Hide link</h3>
		<p class="py-4">
			Links are permanent and cannot be deleted so this will only hide <b
				>{base_url + '/' + hide_modal.data?.id}</b
			> from the list.
		</p>
		<div class="btn-group float-right">
			<button
				class="btn"
				on:click={() => {
					hide_modal.dialog.close()
				}}>Cancel</button
			>
			<button hidden />
			<form action="?/hide" method="post" use:enhance={hide_form.handle}>
				<input type="text" hidden name="shortid" bind:value={hide_modal.user_data._shortid} />
				<button hidden />
				<button class="btn btn-error" class:loading={hide_form.loading} type="submit">Hide</button>
			</form>
		</div>
	</label>
</dialog>

<!-- Show modal -->

<dialog class="modal" bind:this={show_modal.dialog}>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
	<label class="modal-box relative" for="">
		<h3 class="text-lg font-bold">Show link</h3>
		<p class="py-4">
			The link <b>{base_url + '/' + show_modal.data?.id}</b> will be visible in the list.
		</p>
		<div class="btn-group float-right">
			<button
				class="btn"
				on:click={() => {
					show_modal.dialog.close()
				}}>Cancel</button
			>
			<button hidden />
			<form action="?/hide" method="post" use:enhance={show_form.handle}>
				<input type="text" hidden name="shortid" bind:value={show_modal.user_data._shortid} />
				<input type="checkbox" hidden name="show" checked />
				<button hidden />
				<button class="btn btn-success" class:loading={show_form.loading} type="submit">Show</button
				>
			</form>
		</div>
	</label>
</dialog>
