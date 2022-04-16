<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	export let onPercent = false;

	let batteryPercent = 0;
	let interval: any;

	const getBattery = () => {
		navigator.getBattery().then((battery) => {
			batteryPercent = battery.level * 100;
			const inner: HTMLDivElement = document.querySelector(".batteryInner");
			inner.style.setProperty("--percent", `${batteryPercent}%`);
		});
	};

	onMount(() => {
		getBattery();
		interval = setInterval(getBattery, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="container">
	{#if onPercent}
		<div class="percentage">{batteryPercent}%</div>
	{/if}

	<div class="batteryOuter">
		<div class="batteryInner"></div>
	</div>
</div>

<style src="./Battery.scss"></style>
