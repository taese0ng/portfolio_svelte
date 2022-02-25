<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import Color from "~/assets/color";
	import { onMount } from "svelte";
	export let item: DockItemType;
	export let onClose: (id: number) => void;
	export let onUpper: (id: number) => void;

	let header: HTMLDivElement;
	let container: HTMLDivElement;
	let isClicked = false;

	let shiftX: number, shiftY: number;

	const onMouseMove = (e: MouseEvent) => {
		if (isClicked) {
			container.style.left = `${e.pageX - shiftX}px`;
			container.style.top = `${e.pageY - shiftY}px`;
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		isClicked = true;
		shiftX = e.clientX - container.getBoundingClientRect().left;
		shiftY = e.clientY - container.getBoundingClientRect().top;
	};

	const onMouseUp = () => {
		isClicked = false;
	};

	onMount(() => {
		header.addEventListener("mousedown", onMouseDown);
		header.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	});

	const handleCloseModal = () => {
		onClose(item.id);
	};

	const handleUppderModal = () => {
		onUpper(item.id);
	};
</script>

<div
	on:mousedown="{handleUppderModal}"
	bind:this="{container}"
	class="container"
	style="
		--Color:{Color.gray_20};
		--BorderColor:{Color.gray_50};
		--Width:{item.width || 500}px;
		--Height:{item.height || 300}px;
		--ZIndex:{item.zIndex};
	"
>
	<div
		bind:this="{header}"
		class="header"
		style="--Color:{Color.gray_10}; --BorderColor:{Color.gray_50}"
	>
		<div
			on:click="{handleCloseModal}"
			class="circle"
			style="--Color:{Color.red_10}"
		>
			<div class="circle--icon circle--icon__close">ⅹ</div>
		</div>
		{item.title}
	</div>

	<div class="body">
		<slot />
	</div>
</div>

<style lang="scss">
	.container {
		position: absolute;
		width: var(--Width);
		height: var(--Height);
		background: var(--Color);
		border-radius: 8px;
		left: calc(50% - var(--Width) / 2);
		top: calc(20%);
		border: 1px solid var(--BorderColor);
		z-index: var(--ZIndex);
	}

	.body {
		width: 100%;
		height: calc(100% - 30px);
		border-radius: inherit;
	}

	.header {
		border-radius: 8px 8px 0 0;
		width: 100%;
		height: 30px;
		background: var(--Color);
		display: flex;
		justify-content: center;
		align-items: center;
		border-bottom: 1px solid var(--BorderColor);
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	.circle {
		border-radius: 100%;
		width: 13px;
		height: 13px;
		display: flex;
		justify-content: center;
		background: var(--Color);
		cursor: pointer;
		position: absolute;
		left: 15px;

		.circle--icon {
			display: none;
		}

		.circle--icon__close {
			top: 50%;
			transform: translateY(-60%);
		}

		&:hover {
			.circle--icon {
				display: unset;
				font-size: 10px;
				position: relative;
			}
		}
	}
</style>
