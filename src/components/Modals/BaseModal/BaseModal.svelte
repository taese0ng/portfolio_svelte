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
		resizeObj = {
			dir: "",
			top: 0,
			bottom: 0,
			right: 0,
			left: 0,
			height: 0,
			width: 0,
		};

	const containerMinWidth = item.width - 100;
	const containerMinHeight = item.height - 100;

	const saveResizeObj = () => {
		resizeObj.width = parseFloat(container.style.width);
		resizeObj.height = parseFloat(container.style.height);
		resizeObj.top = parseFloat(container.style.top);
		resizeObj.left = parseFloat(container.style.left);

		sessionStorage.setItem(
			`${item.id}LocationCoords`,
			JSON.stringify(resizeObj),
		);
	};

	const onMouseMove = (e: MouseEvent) => {
		if (isClicked) {
			container.style.left = `${e.pageX - shiftX}px`;
			container.style.top = `${e.pageY - shiftY}px`;

			saveResizeObj();
		} else if (isResizeClicked) {
			const height = resizeObj.bottom - e.pageY;
			const width = resizeObj.right - e.pageX;
			switch (resizeObj.dir) {
				case "top":
					if (containerMinHeight < height) {
						container.style.top = `${e.pageY}px`;
						container.style.height = `${height}px`;
					}
					break;
				case "bottom":
					container.style.height = `${e.pageY - resizeObj.top}px`;
					break;
				case "right":
					container.style.width = `${e.pageX - resizeObj.left}px`;
					break;
				case "left":
					if (containerMinWidth < width) {
						container.style.left = `${e.pageX}px`;
						container.style.width = `${width}px`;
					}
					break;
				case "rb":
					container.style.height = `${e.pageY - resizeObj.top}px`;
					container.style.width = `${e.pageX - resizeObj.left}px`;
					break;
				case "lb":
					container.style.height = `${e.pageY - resizeObj.top}px`;
					if (containerMinWidth < width) {
						container.style.left = `${e.pageX}px`;
						container.style.width = `${width}px`;
					}
					break;
				case "rt":
					container.style.width = `${e.pageX - resizeObj.left}px`;
					if (containerMinHeight < height) {
						container.style.top = `${e.pageY}px`;
						container.style.height = `${height}px`;
					}
					break;
				case "lt":
					if (containerMinHeight < height) {
						container.style.top = `${e.pageY}px`;
						container.style.height = `${height}px`;
					}
					if (containerMinWidth < width) {
						container.style.left = `${e.pageX}px`;
						container.style.width = `${width}px`;
					}
					break;
				default:
					break;
			}
			saveResizeObj();
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
				resizeObj.dir = "top";
				resizeObj.bottom = bottomSetter.getBoundingClientRect().top;
				break;
			case "bottom":
				resizeObj.dir = "bottom";
				resizeObj.top = topSetter.getBoundingClientRect().top;
				break;
			case "right":
				resizeObj.dir = "right";
				resizeObj.left = leftSetter.getBoundingClientRect().left;
				break;
			case "left":
				resizeObj.dir = "left";
				resizeObj.right = rightSetter.getBoundingClientRect().right;
				break;
			case "rb":
				resizeObj.dir = "rb";
				resizeObj.left = leftSetter.getBoundingClientRect().left;
				resizeObj.top = topSetter.getBoundingClientRect().top;
				break;
			case "lb":
				resizeObj.dir = "lb";
				resizeObj.right = rightSetter.getBoundingClientRect().right;
				resizeObj.top = topSetter.getBoundingClientRect().top;
				break;
			case "rt":
				resizeObj.dir = "rt";
				resizeObj.left = leftSetter.getBoundingClientRect().left;
				resizeObj.bottom = bottomSetter.getBoundingClientRect().top;
				break;
			case "lt":
				resizeObj.dir = "lt";
				resizeObj.right = rightSetter.getBoundingClientRect().right;
				resizeObj.bottom = bottomSetter.getBoundingClientRect().top;
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
		if (sessionStorage.getItem(`${item.id}LocationCoords`)) {
			resizeObj = JSON.parse(
				sessionStorage.getItem(`${item.id}LocationCoords`),
			);
			container.style.top = `${resizeObj.top}px`;
			container.style.left = `${resizeObj.left}px`;
			if (item.resizeable) {
				container.style.width = `${resizeObj.width}px`;
				container.style.height = `${resizeObj.height}px`;
			}
		}
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
