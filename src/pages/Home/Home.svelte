<script lang="ts">
	import { bgImg } from "~/store";
	import type { DockItemType } from "@interfaces/dock";
	import Header from "@components/Header";
	import Dock from "@components/Dock";
	import { BaseModal } from "@components/Modals";
	import { itemList } from "@constants/dock";

	const handleOpenModal = (id: string, nowOpen = false) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);
		const zIndexs = itemList.map((item: DockItemType) => item.zIndex);

		itemList[index].zIndex = Math.max(...zIndexs) + 1;
		itemList[index].isOpen = true;
		itemList[index].nowOpen = nowOpen;
	};

	const handleCloseModal = (id: string) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);

		itemList[index].zIndex = 0;
		itemList[index].isOpen = false;
	};

	const handleUpperModal = (id: string) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);
		const zIndexs = itemList.map((item: DockItemType) => item.zIndex);
		const maxIndex = Math.max(...zIndexs);

		if (itemList[index].zIndex < maxIndex) {
			itemList[index].zIndex = maxIndex + 1;
		}
	};

	const init = () => {
		const bg = JSON.parse(localStorage.getItem("background")) || null;

		if (bg) {
			bgImg.set(bg.src);
		}
	};

	init();
</script>

<main>
	<Header
		itemList="{itemList}"
		onOpenModal="{handleOpenModal}"
		onUpperModal="{handleUpperModal}"
	/>

	<img
		class="background-img"
		src="{$bgImg}"
		alt="background"
		draggable="false"
	/>

	{#each itemList as item}
		{#if item.isOpen}
			<BaseModal
				item="{item}"
				absoluteHeader="{item?.isAbsoluteHeader}"
				nowOpen="{item.nowOpen}"
				onCloseModal="{handleCloseModal}"
				onUpperModal="{handleUpperModal}"
			>
				<svelte:component this="{item.component}" />
			</BaseModal>
		{/if}
	{/each}

	<Dock
		itemList="{itemList}"
		onOpenModal="{handleOpenModal}"
		onUpperModal="{handleUpperModal}"
	/>
</main>

<style src="./Home.scss"></style>
