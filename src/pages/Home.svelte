<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import Header from "@components/Header";
	import Dock from "@components/Dock";
	import { BaseModal, Info, Price } from "@components/Modals";

	const itemList: Array<DockItemType> = [
		{
			id: 0,
			title: "내 정보",
			isOpen: false,
			icon: "images/myInfo.png",
			component: Info,
			zIndex: 0,
		},
		{
			id: 1,
			title: "수상경력",
			isOpen: false,
			icon: "images/price.png",
			component: Price,
			zIndex: 0,
			width: 800,
			height: 500,
		},
		{
			id: 2,
			title: "2",
			isOpen: false,
			icon: "images/finder.png",
			component: Info,
			zIndex: 0,
		},
		{ id: 3, title: "3", isOpen: false, icon: "", component: Info, zIndex: 0 },
		{ id: 4, title: "4", isOpen: false, icon: "", component: Info, zIndex: 0 },
		{ id: 5, title: "5", isOpen: false, icon: "", component: Info, zIndex: 0 },
		{ id: 6, title: "6", isOpen: false, icon: "", component: Info, zIndex: 0 },
	];

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
	<img class="background-img" src="images/background.png" alt="background" />

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

<style lang="scss">
	main {
		width: 100%;
		height: calc(100% - 23px);
		padding-top: 23px;
	}

	.background-img {
		position: absolute;
		top: 0;
		object-fit: cover;
		width: 100%;
		height: 100%;
		z-index: -1;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
</style>
