<script lang="ts">
	import { mobileBgImg } from "~/store";
	import { beforeUpdate } from "svelte";
	import Dock from "@components/Mobile/Dock";
	import Layout from "@components/Mobile/Layout";
	import Background from "@components/Mobile/Background";
	import { itemList, itemIDs } from "@constants/dock";

	const dockItemIds = [itemIDs.myInfo, itemIDs.history, itemIDs.settings];
	const dockItems = [];
	const backgroundItems = [];

	itemList.forEach((item) => {
		for (let i = 0; i < dockItemIds.length; i++) {
			if (dockItemIds[i] === item.id) {
				return dockItems.push(item);
			}
		}
		return backgroundItems.push(item);
	});

	beforeUpdate(() => {
		const bg = JSON.parse(localStorage.getItem("mobileBackground")) || null;

		if (bg) {
			mobileBgImg.set(bg);
		}
	});
</script>

<Layout>
	<div class="wrapper">
		<img src="{$mobileBgImg.src}" alt="bgImg" class="bgImg" draggable="false" />

		<Background items="{backgroundItems}" />

		<Dock dockItems="{dockItems}" />
	</div>
</Layout>

<style src="./Home.scss"></style>
