<script lang="ts">
	import { onMount } from "svelte";
	import type { DockItemType } from "@interfaces/dock";

	export let itemList: Array<DockItemType>;
	export let onOpen: (id: number) => void;
	export let onUpper: (id: number) => void;

	const onClickMenu = (e: any, item: DockItemType) => {
		e.preventDefault();
		if (!item.isOpen) {
			e.target.classList.remove("bounce"); // reset animation
			void e.target.offsetWidth; // trigger reflow
			e.target.classList.add("bounce"); // start animation
			setTimeout(() => {
				onOpen(item.id);
			}, 900);
		} else {
			onUpper(item.id);
		}
	};

	onMount(() => {
		const elements = document.getElementsByClassName("menu__item");
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.remove("bounce");
		}
	});
</script>

<div class="container">
	<div class="menu">
		{#each itemList as item}
			<div
				class="menu__item bounce"
				on:click="{(e) => onClickMenu(e, item)}"
				style="--icon:{`url(${item.icon})`}; --bgColor:{item.icon
					? 'transparent'
					: 'red'};"
			>
				{item.icon !== "" ? "" : item.title}
				{#if item.isOpen}
					<div class="menu__item__dot"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style src="./Dock.scss"></style>
