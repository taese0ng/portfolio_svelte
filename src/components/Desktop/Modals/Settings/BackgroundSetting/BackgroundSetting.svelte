<script lang="ts">
	import { bgImg } from "~/store";
	import { bgImgs } from "@constants/bgSetting";
	import type { BgImg } from "@interfaces/bgSetting";

	const handleSetImg = (bg: BgImg) => {
		bgImg.set(bg);
		localStorage.setItem("background", JSON.stringify(bg));
	};
</script>

<div class="container">
	<div class="header">
		<div class="header__title">배경 설정</div>
	</div>

	<div class="body">
		<div class="itemsWrapper">
			{#each bgImgs as img}
				<div class="item" on:click="{() => handleSetImg(img)}">
					<img
						class="item__img"
						class:selected="{$bgImg.title === img.title}"
						src="{img.thumb}"
						alt="bg"
					/>
					<div class="item__title">{img.title}</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style src="./BackgroundSetting.scss"></style>
