<script lang="ts">
	import { isMobile } from "~/store";
	import { onMount } from "svelte";
	export let onPercent = false;

	let isSupport = false;
	let batteryPercent = 0;

	const setBatteryPercent = (battery) => {
		batteryPercent = battery.level * 100;
		const inner: HTMLDivElement = document.querySelector(".batteryInner");
		inner.style.setProperty("--percent", `${batteryPercent}%`);
	};

	const updateBatteryStatus = () => {
		navigator.getBattery().then((battery) => {
			setBatteryPercent(battery);

			battery.onlevelchange = () => {
				setBatteryPercent(battery);
			};
		});
	};

	onMount(() => {
		if (navigator.getBattery) {
			isSupport = true;
			updateBatteryStatus();
		}
	});
</script>

{#if isSupport}
	<div class="container">
		{#if onPercent}
			<div class="percentage" class:isMobile>{batteryPercent.toFixed()}%</div>
		{/if}

		<div class="batteryOuter" class:isMobile>
			<div class="batteryInner"></div>
		</div>
	</div>
{/if}

<style src="./Battery.scss"></style>
