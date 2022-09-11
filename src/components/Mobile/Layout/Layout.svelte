<script lang="ts">
	import Header from "@components/Mobile/Header";
	import { location, querystring, replace } from "svelte-spa-router";

	export let title = "";

	const backBtnIcon = "./images/icons/backBtn.png";
	const homePath = "/";
	let isApp = false;

	const checkLocation = () => {
		if ($location !== homePath) {
			isApp = true;
		}
	};

	const handleClickBack = () => {
		const locations = $location.split("/").filter((i: string) => i.length > 0);
		const backLocation =
			$querystring.length > 0
				? locations.splice(0, locations.length).join("/")
				: locations.splice(0, locations.length - 1).join("/");

		replace(`/${backLocation}`);
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
