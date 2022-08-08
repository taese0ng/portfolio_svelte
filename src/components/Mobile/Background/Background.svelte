<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import { push } from "svelte-spa-history-router";

	export let items: Array<DockItemType>;

	const handleClickItem = (item: DockItemType) => {
		push(`/${item.id}`);
	};
</script>

<div class="container">
	{#each items as item}
		<div class="itemContainer">
			<div
				class="item"
				on:click="{() => {
					handleClickItem(item);
				}}"
			>
				<img src="{item.icon}" alt="{item.title}" />
			</div>
			<span class="itemTitle">{item.title}</span>
		</div>
	{/each}
</div>

<style src="./Background.scss"></style>
