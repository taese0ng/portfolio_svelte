<script lang="ts">
	import { beforeUpdate } from "svelte";
	import { replace, querystring } from "svelte-spa-router";
	import Layout from "@components/Mobile/Layout";
	import Popup from "@components/Desktop/Popup";
	import { awardList } from "@constants/awards";
	import type { Award } from "@interfaces/awards";

	const param = "id";
	let selectedAward: Award | null = null;
	let isOpenPopup = false;

	const handleClickAward = (award: Award) => {
		replace(`/award?${param}=${award.id}`);
	};

	const handleClosePopup = () => {
		replace("/award");
	};

	beforeUpdate(() => {
		const searchParams = new URLSearchParams($querystring);
		const hasParams = searchParams.has(param);

		selectedAward = awardList.find(
			(award) => award.id === searchParams.get(param),
		);

		if (selectedAward && hasParams) {
			isOpenPopup = true;
		} else if (hasParams && !selectedAward) {
			selectedAward = null;
			isOpenPopup = false;
			replace("/award");
		}
	});
</script>

<Layout>
	<div class="wrapper">
		<ul class="awards">
			{#each awardList as award}
				<li class="awards__item">
					<img
						on:click="{() => handleClickAward(award)}"
						class="awards__item--img"
						src="{award.thumb}"
						alt="{award.title}"
					/>
					<div class="awards__item--title">{award.title}</div>
					<div class="awards__item--class">- {award.class} -</div>
				</li>
			{/each}
		</ul>

		{#if isOpenPopup && selectedAward}
			<Popup onClosePopup="{handleClosePopup}">
				<div class="imageWrapper">
					<img src="{selectedAward.src}" alt="{selectedAward.title}" />
				</div>
			</Popup>
		{/if}
	</div>
</Layout>

<style src="./Award.scss"></style>
