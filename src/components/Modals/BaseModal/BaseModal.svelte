<script lang="ts">
	import type { DockItemType } from "@interfaces/dock";
	import { onMount } from "svelte";
	export let item: DockItemType;
	export let onCloseModal: (id: string) => void;
	export let onUpperModal: (id: string) => void;

	onMount(() => {
		header.addEventListener("mousedown", onMouseDown);
		header.addEventListener("mouseup", onMouseUp);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	});

	let header: HTMLDivElement,
		container: HTMLDivElement,
		isClicked = false,
		shiftX: number,
		shiftY: number;

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
	style="
		--Width:{item.width || 500}px;
		--Height:{item.height || 300}px;
		--ZIndex:{item.zIndex};
	"
>
	<div bind:this="{header}" class="header">
		<div on:click="{handleCloseModal}" class="circle">
			<div class="circle--icon circle--icon__close">ⅹ</div>
		</div>
		{item.title}
	</div>

	<div class="body">
		<slot />
	</div>
</div>

<style src="./BaseModal.scss"></style>
