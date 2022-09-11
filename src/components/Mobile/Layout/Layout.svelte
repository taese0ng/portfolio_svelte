<script lang="ts">
	import Header from "@components/Mobile/Header";
	import { location, pop, querystring, replace } from "svelte-spa-router";

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
		if ($querystring.length === 0) {
			replace("/");
		} else {
			pop();
		}
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
