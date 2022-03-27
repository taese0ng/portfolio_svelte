<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import { onMount } from "svelte";
	export let item: DockItemType;
	export let absoluteHeader = false;
	export let onCloseModal: (id: string) => void;
	export let onUpperModal: (id: string) => void;
	export let nowOpen = false;

	let isVisible = false;

	let header: HTMLDivElement,
		container: HTMLDivElement,
		isClicked = false,
		shiftX = 0,
		shiftY = 0;

	onMount(() => {
		header.addEventListener("mousedown", onMouseDown);
		header.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);

		setTimeout(
			() => {
				isVisible = true;
			},
			nowOpen ? 0 : 900,
		);
	});

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

	const handleCloseModal = () => {
		onCloseModal(item.id);
	};

	const handleUppderModal = () => {
		onUpperModal(item.id);
	};
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
	<div bind:this="{header}" class="header" class:absoluteHeader>
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
