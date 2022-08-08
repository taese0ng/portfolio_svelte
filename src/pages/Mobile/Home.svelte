<script lang="ts">
	import Dock from "@components/Mobile/Dock";
	import Header from "@components/Mobile/Header";
	import { mobileImgs } from "@constants/bgSetting";
	import { itemList, itemIDs } from "@constants/dock";

	const bgImg = mobileImgs[0].thumb;
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
</script>

<div class="container">
	<img src="{bgImg}" alt="bgImg" class="bgImg" draggable="false" />
	<Header />

	<Dock dockItems="{dockItems}" />
</div>

<style src="./Home.scss"></style>
