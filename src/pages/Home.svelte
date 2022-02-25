<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import Header from "@components/Header";
	import Dock from "@components/Dock";
	import { BaseModal } from "@components/Modals";
	import { itemList } from "@constants/dock";

	const backgroundImg = "images/background.png";

	const handleOpenModal = (id: number) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);
		const zIndexs = itemList.map((item: DockItemType) => item.zIndex);

		itemList[index].zIndex = Math.max(...zIndexs) + 1;
		itemList[index].isOpen = true;
	};

	const handleCloseModal = (id: number) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);

		itemList[index].zIndex = 0;
		itemList[index].isOpen = false;
	};

	const handleUpperModal = (id: number) => {
		const index = itemList.findIndex((item: DockItemType) => item.id === id);
		const zIndexs = itemList.map((item: DockItemType) => item.zIndex);
		const maxIndex = Math.max(...zIndexs);

		if (itemList[index].zIndex < maxIndex) {
			itemList[index].zIndex = maxIndex + 1;
		}
	};
</script>

<Header />
<main>
	<img class="background-img" src="{backgroundImg}" alt="background" />

	{#each itemList as item}
		{#if item.isOpen}
			<BaseModal
				item="{item}"
				onClose="{handleCloseModal}"
				onUpper="{handleUpperModal}"
			>
				<svelte:component this="{item.component}" />
			</BaseModal>
		{/if}
	{/each}
</main>
<Dock
	itemList="{itemList}"
	onOpen="{handleOpenModal}"
	onUpper="{handleUpperModal}"
/>

<style src="./Home.scss"></style>
