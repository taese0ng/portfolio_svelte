<script lang="ts">
	import { onMount } from "svelte";
	import type { DockItemType } from "@interfaces/dock";

	export let itemList: Array<DockItemType>;
	export let onOpenModal: (id: string) => void;
	export let onUpperModal: (id: string) => void;

	const onClickMenu = (
		e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement },
		item: DockItemType,
	) => {
		e.preventDefault();
		if (!item.isOpen) {
			e.currentTarget.classList.remove("bounce"); // reset animation
			void e.currentTarget.offsetWidth; // trigger reflow
			e.currentTarget.classList.add("bounce"); // start animation
			setTimeout(() => {
				onOpenModal(item.id);
			}, 900);
		} else {
			onUpperModal(item.id);
		}
	};

	onMount(() => {
		const elements = document.getElementsByClassName("menu__item__icon");

		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.remove("bounce");
		}
	});
</script>

<div class="container" id="dock">
	<div class="menu">
		{#each itemList as item}
			<div class="menu__item">
				<div class="menu__item__title">{item.title}</div>

				<div
					class="menu__item__icon bounce"
					style="
					--bgColor:{item.icon ? 'transparent' : 'red'};
					"
					on:click="{(e) => onClickMenu(e, item)}"
				>
					<img src="{item.icon}" alt="{item.title}" />
				</div>

				{#if item.isOpen}
					<div class="menu__item__dot"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style src="./Dock.scss"></style>
