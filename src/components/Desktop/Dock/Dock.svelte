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

			onOpenModal(item.id);
		} else {
			onUpperModal(item.id);
		}
	};

	const handleClickSafari = () => {
		window.open("https://www.google.co.kr");
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
		<div class="menu__item">
			<div class="menu__item__title">safari</div>

			<div
				class="menu__item__icon bounce"
				style="
				--bgColor:'transparent';
				"
				on:click="{handleClickSafari}"
			>
				<img src="./images/icons/safari.png" alt="safari" />
			</div>
		</div>
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
