<script lang="ts">
	import { mobileBgImg } from "~/store";
	import { beforeUpdate } from "svelte";
	import Layout from "@components/Mobile/Layout";
	import { mobileImgs } from "@constants/bgSetting";
	import type { BgImg } from "@interfaces/bgSetting";

	const handleSelectBg = (bg: BgImg) => {
		mobileBgImg.set(bg);
		localStorage.setItem("mobileBackground", JSON.stringify(bg));
	};

	beforeUpdate(() => {
		const bg = JSON.parse(localStorage.getItem("mobileBackground"));

		mobileBgImg.set(bg);
	});
</script>

<Layout title="환경설정">
	<ul class="backgrounds">
		{#each mobileImgs as bg}
			<li class="backgrounds__item" on:click="{() => handleSelectBg(bg)}">
				<img
					class:selected="{$mobileBgImg.title === bg.title}"
					class="backgrounds__item--thumb"
					src="{bg.thumb}"
					alt="bg.title"
				/>
				<div
					class="backgrounds__item--title"
					class:selectedTitle="{$mobileBgImg.title === bg.title}"
				>
					{bg.title}
				</div>
			</li>
		{/each}
	</ul>
</Layout>

<style src="./Setting.scss"></style>
