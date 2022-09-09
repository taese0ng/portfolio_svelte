<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	const dock: HTMLDivElement = document.querySelector("#dock");
	const header: HTMLDivElement = document.querySelector("#header");
	const closeIcon = "./images/icons/closeIcon.png";

	export let onClosePopup: (e?: MouseEvent) => void;
	export let hasCloseBtn: boolean = false;

	const handleClosePopup = (e?: MouseEvent) => {
		onClosePopup(e);
	};

	const handleClickSlot = (e: MouseEvent) => {
		e.stopPropagation();
	};

	onMount(() => {
		if (header && dock) {
			header.style.zIndex = "0";
			dock.style.zIndex = "-1";
		}
	});

	onDestroy(() => {
		if (header && dock) {
			header.style.zIndex = "70000";
			dock.style.zIndex = "70000";
		}
	});
</script>

<div class="container" on:click="{() => !hasCloseBtn && handleClosePopup()}">
	<div class="slotWrapper" on:click="{handleClickSlot}">
		{#if hasCloseBtn}
			<div class="closeBtn" on:click="{handleClosePopup}">
				<img src="{closeIcon}" alt="closeBtn" />
			</div>
		{/if}

		<slot />
	</div>
</div>

<style src="./Popup.scss"></style>
