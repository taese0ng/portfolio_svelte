<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import { onMount } from "svelte";
	export let item: DockItemType;
	export let absoluteHeader = false;
	export let onCloseModal: (id: string) => void;
	export let onUpperModal: (id: string) => void;
	export let nowOpen = false;

	let isVisible = false;

	let container: HTMLDivElement,
		topSetter: HTMLDivElement,
		bottomSetter: HTMLDivElement,
		rightSetter: HTMLDivElement,
		leftSetter: HTMLDivElement,
		isResizeClicked = false,
		isClicked = false,
		shiftX = 0,
		shiftY = 0,
		isResizeObj = { dir: "", top: 0, bottom: 0, right: 0, left: 0 };

	const containerMinWidth = item.width - 100;
	const containerMinHeight = item.height - 100;

	const onMouseMove = (e: MouseEvent) => {
		const style = container.style;
		if (isClicked) {
			style.left = `${e.pageX - shiftX}px`;
			style.top = `${e.pageY - shiftY}px`;
		} else if (isResizeClicked) {
			const height = isResizeObj.bottom - e.pageY;
			const width = isResizeObj.right - e.pageX;
			switch (isResizeObj.dir) {
				case "top":
					if (containerMinHeight < height) {
						style.top = `${e.pageY}px`;
						style.height = `${height}px`;
					}
					break;
				case "bottom":
					style.height = `${e.pageY - isResizeObj.top}px`;
					break;
				case "right":
					style.width = `${e.pageX - isResizeObj.left}px`;
					break;
				case "left":
					if (containerMinWidth < width) {
						style.left = `${e.pageX}px`;
						style.width = `${width}px`;
					}
					break;
				case "rb":
					style.height = `${e.pageY - isResizeObj.top}px`;
					style.width = `${e.pageX - isResizeObj.left}px`;
					break;
				case "lb":
					style.height = `${e.pageY - isResizeObj.top}px`;
					if (containerMinWidth < width) {
						style.left = `${e.pageX}px`;
						style.width = `${width}px`;
					}
					break;
				case "rt":
					style.width = `${e.pageX - isResizeObj.left}px`;
					if (containerMinHeight < height) {
						style.top = `${e.pageY}px`;
						style.height = `${height}px`;
					}
					break;
				case "lt":
					if (containerMinHeight < height) {
						style.top = `${e.pageY}px`;
						style.height = `${height}px`;
					}
					if (containerMinWidth < width) {
						style.left = `${e.pageX}px`;
						style.width = `${width}px`;
					}
					break;
				default:
					break;
			}
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		isClicked = true;
		shiftX = e.clientX - container.getBoundingClientRect().left;
		shiftY = e.clientY - container.getBoundingClientRect().top;
	};

	const onMouseUp = () => {
		isClicked = false;
		isResizeClicked = false;
	};

	const onResizeMouseDown = (dir: string) => {
		isResizeClicked = true;
		switch (dir) {
			case "top":
				isResizeObj.dir = "top";
				isResizeObj.bottom = bottomSetter.getBoundingClientRect().top;

				break;
			case "bottom":
				isResizeObj.dir = "bottom";
				isResizeObj.top = topSetter.getBoundingClientRect().top;

				break;
			case "right":
				isResizeObj.dir = "right";
				isResizeObj.left = leftSetter.getBoundingClientRect().left;

				break;
			case "left":
				isResizeObj.dir = "left";
				isResizeObj.right = rightSetter.getBoundingClientRect().right;

				break;
			case "rb":
				isResizeObj.dir = "rb";
				isResizeObj.left = leftSetter.getBoundingClientRect().left;
				isResizeObj.top = topSetter.getBoundingClientRect().top;
				break;
			case "lb":
				isResizeObj.dir = "lb";
				isResizeObj.right = rightSetter.getBoundingClientRect().right;
				isResizeObj.top = topSetter.getBoundingClientRect().top;
				break;
			case "rt":
				isResizeObj.dir = "rt";
				isResizeObj.left = leftSetter.getBoundingClientRect().left;
				isResizeObj.bottom = bottomSetter.getBoundingClientRect().top;
				break;
			case "lt":
				isResizeObj.dir = "lt";
				isResizeObj.right = rightSetter.getBoundingClientRect().right;
				isResizeObj.bottom = bottomSetter.getBoundingClientRect().top;
				break;
			default:
				break;
		}
	};

	const handleCloseModal = () => {
		onCloseModal(item.id);
	};

	const handleUppderModal = () => {
		onUpperModal(item.id);
	};

	onMount(() => {
		container.style.minWidth = `${containerMinWidth}px`;
		container.style.minHeight = `${containerMinHeight}px`;
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);

		setTimeout(
			() => {
				isVisible = true;
			},
			nowOpen ? 0 : 900,
		);
	});
</script>

<div
	on:mousedown="{handleUppderModal}"
	bind:this="{container}"
	class="container"
	class:visibility="{!isVisible}"
	style="
		--width:{item.width || 500}px;
		--height:{item.height || 300}px;
		--zIndex:{item.zIndex};
	"
>
	{#if item.resizeable}
		<div
			bind:this="{topSetter}"
			on:mousedown="{() => onResizeMouseDown('top')}"
			on:mouseup="{onMouseUp}"
			class="topSetter setter"
		></div>
		<div
			bind:this="{bottomSetter}"
			on:mousedown="{() => onResizeMouseDown('bottom')}"
			on:mouseup="{onMouseUp}"
			class="bottomSetter setter"
		></div>
		<div
			bind:this="{rightSetter}"
			on:mousedown="{() => onResizeMouseDown('right')}"
			on:mouseup="{onMouseUp}"
			class="rightSetter setter"
		></div>
		<div
			bind:this="{leftSetter}"
			on:mousedown="{() => onResizeMouseDown('left')}"
			on:mouseup="{onMouseUp}"
			class="leftSetter setter"
		></div>
		<div
			on:mousedown="{() => onResizeMouseDown('rb')}"
			on:mouseup="{onMouseUp}"
			class="rbSetter setter"
		></div>
		<div
			on:mousedown="{() => onResizeMouseDown('lb')}"
			on:mouseup="{onMouseUp}"
			class="lbSetter setter"
		></div>
		<div
			on:mousedown="{() => onResizeMouseDown('rt')}"
			on:mouseup="{onMouseUp}"
			class="rtSetter setter"
		></div>
		<div
			on:mousedown="{() => onResizeMouseDown('lt')}"
			on:mouseup="{onMouseUp}"
			class="ltSetter setter"
		></div>
	{/if}

	<div
		on:mousedown="{onMouseDown}"
		on:mouseup="{onMouseUp}"
		class="header"
		class:absoluteHeader
	>
		<div on:click="{handleCloseModal}" class="circle">
			<div class="circle--icon circle--icon__close">ⅹ</div>
		</div>
		{#if !absoluteHeader}
			{item.title}
		{/if}
	</div>

	<div class="body">
		<slot />
	</div>
</div>

<style src="./BaseModal.scss"></style>
