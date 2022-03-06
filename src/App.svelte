<script lang="ts">
	import { isMobile } from "~/store";
	import { Home, Error } from "~/pages";

	const stdWidth = 900;
	let innerWidth = window.innerWidth;

	// $: 구문으로 인해 innerWidth가 변경될때마다 handleResizeWindow함수가 실행
	$: innerWidth, handleResizeWindow();

	const handleResizeWindow = () => {
		if (innerWidth <= stdWidth) {
			isMobile.set(true);
		} else {
			isMobile.set(false);
		}
	};
</script>

<svelte:window bind:innerWidth />
{#if $isMobile}
	<Error />
{:else}
	<Home />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
