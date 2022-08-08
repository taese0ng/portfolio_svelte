<script lang="ts">
	import { push } from "svelte-spa-history-router";
	import type { DockItemType } from "~/interfaces/dock";

	export let dockItems: Array<DockItemType>;

	const handleClickSafari = () => {
		window.open("https://www.google.co.kr");
	};

	const handleClickItem = (item: DockItemType) => {
		push(`/${item.id}`);
	};
</script>

<div class="container">
	<div class="item" on:click="{handleClickSafari}">
		<img src="./images/icons/safari.png" alt="safari" />
	</div>

	{#each dockItems as item}
		<div
			class="item"
			on:click="{() => {
				handleClickItem(item);
			}}"
		>
			<img src="{item.icon}" alt="{item.title}" />
		</div>
	{/each}
</div>

<style src="./Dock.scss"></style>
