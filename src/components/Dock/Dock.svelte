<script lang="ts">
	import { onMount } from "svelte";
	import type { DockItemType } from "@interfaces/dock";
	import Color from "~/assets/color";

	export let itemList: Array<DockItemType>;
	export let onOpen: (id: number) => void;
	export let onUpper: (id: number) => void;

	const onClickMenu = (e: any, item: DockItemType) => {
		e.preventDefault();
		if (!item.isOpen) {
			e.target.classList.remove("bounce"); // reset animation
			void e.target.offsetWidth; // trigger reflow
			e.target.classList.add("bounce"); // start animation
			setTimeout(() => {
				onOpen(item.id);
			}, 900);
		} else {
			onUpper(item.id);
		}
	};

	onMount(() => {
		const elements = document.getElementsByClassName("menu__item");
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.remove("bounce");
		}
	});
</script>

<div class="container">
	<div class="menu">
		{#each itemList as item}
			<div
				class="menu__item bounce"
				on:click="{(e) => onClickMenu(e, item)}"
				style="--icon:{`url(${item.icon})`}; --bgColor:{item.icon
					? 'transparent'
					: 'red'};"
			>
				{item.icon !== "" ? "" : item.title}
				{#if item.isOpen}
					<div
						class="menu__item__dot"
						style="--Color:{Color.darkBlue_10}"
					></div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.container {
		position: absolute;
		bottom: 4px;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.menu {
		background: #ffffff70;
		-webkit-backdrop-filter: blur(30px);
		backdrop-filter: blur(30px);
		border: 1px solid #ffffff40;
		display: flex;
		padding: 8px 5px 14px 5px;
		border-radius: 20px;
	}

	.menu__item {
		width: 50px;
		height: 50px;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 6px;
		cursor: pointer;
		background-color: var(--bgColor);
		background-image: var(--icon);
		background-size: 100%;

		& > &__dot {
			position: absolute;
			width: 4px;
			height: 4px;
			border-radius: 100%;
			background: var(--Color);
			bottom: -10px;
		}
	}

	$bounce-animation: bounce 0.6s linear;
	.bounce {
		position: relative;
		-moz-animation: $bounce-animation; /* 파폭 */
		-webkit-animation: $bounce-animation; /* 크롬 */
		-o-animation: $bounce-animation;
		animation: $bounce-animation;
	}

	/* 바운스의 높이 0% 일 때, 0px 50%일 때, -5px 70%일 때, -50px 100%일 때, 0px */
	@mixin bounce {
		0% {
			top: 0;
		}

		50% {
			top: -20px;
		}

		100% {
			top: 0;
		}
	}
	@-webkit-keyframes bounce {
		@include bounce;
	}
	@-moz-keyframes bounce {
		@include bounce;
	}
	@-o-keyframes bounce {
		@include bounce;
	}
	@-ms-keyframes bounce {
		@include bounce;
	}
	@keyframes bounce {
		@include bounce;
	}
</style>
