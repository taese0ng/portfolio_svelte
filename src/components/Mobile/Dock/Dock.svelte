<script lang="ts">
	import { replace } from "svelte-spa-router";
	import type { DockItemType } from "@interfaces/dock";

	export let dockItems: Array<DockItemType>;

	const handleClickSafari = () => {
		window.open("https://www.google.co.kr");
	};

	const handleClickItem = (item: DockItemType) => {
		replace(`/${item.id}`);
	};
</script>

<div class="container">
	<div class="item" on:click="{handleClickSafari}">
		<img draggable="false" src="./images/icons/safari.png" alt="safari" />
	</div>

	{#each dockItems as item}
		<div
			class="item"
			on:click="{() => {
				handleClickItem(item);
			}}"
		>
			<img draggable="false" src="{item.icon}" alt="{item.title}" />
		</div>
	{/each}
</div>

<style src="./Dock.scss"></style>
