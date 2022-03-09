<script lang="ts">
	import { awardList } from "@constants/awards";
	import type { Award } from "@interfaces/awards";
	import Popup from "@components/Popup";

	let isOpenPopup = false;
	let selectedAward: Award;

	const handleClickItem = (award: Award) => {
		selectedAward = award;
		isOpenPopup = true;
	};

	const handleClosePopup = () => {
		isOpenPopup = false;
	};
</script>

<div class="container">
	<ul class="wrapper">
		{#each awardList as award}
			<li class="item" on:click="{() => handleClickItem(award)}">
				<img class="item__img" src="{award.thumb}" alt="{award.title}" />
				<div class="item__title">{award.title} ({award.class})</div>
			</li>
		{/each}
	</ul>

	{#if isOpenPopup}
		<Popup onClosePopup="{handleClosePopup}" hasCloseBtn>
			<div class="imageWrapper">
				<img src="{selectedAward.src}" alt="{selectedAward.title}" />
			</div>
		</Popup>
	{/if}
</div>

<style src="./Award.scss"></style>
