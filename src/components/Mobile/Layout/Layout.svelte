<script lang="ts">
	import Header from "@components/Mobile/Header";
	import { location, pop } from "svelte-spa-router";
	import { itemList } from "@constants/dock";

	const backBtnIcon = "./images/icons/backBtn.png";
	const homePath = "/";
	let isApp = false;
	let title = "";

	const checkLocation = () => {
		if ($location !== homePath) {
			isApp = true;
		}

		itemList.forEach((item) => {
			if (`/${item.id}` === $location) {
				title = item.title;
			}
		});
	};

	const handleClickBack = () => {
		pop();
	};

	checkLocation();
</script>

<div class="container" class:isApp>
	<Header blackMode="{isApp}" />

	{#if isApp}
		<div class="appHeader">
			<div class="backBtn" on:click="{handleClickBack}">
				<img src="{backBtnIcon}" alt="backBtn" />
			</div>
			<div class="title">{title}</div>
		</div>
	{/if}

	<div class="wrapper" class:isApp>
		<slot />
	</div>
</div>

<style src="./Layout.scss"></style>
