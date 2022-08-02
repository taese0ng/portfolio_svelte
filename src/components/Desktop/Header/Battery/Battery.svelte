<script lang="ts">
	import { onMount } from "svelte";
	import isBrouserCheck from "@utils/isBrowserCheck";
	export let onPercent = false;

	const batteryManagerAbleBrowsers = ["firfox", "Chrome", "Opera"];
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
		if (batteryManagerAbleBrowsers.includes(isBrouserCheck())) {
			isSupport = true;
			updateBatteryStatus();
		}
	});
</script>

{#if isSupport}
	<div class="container">
		{#if onPercent}
			<div class="percentage">{batteryPercent.toFixed()}%</div>
		{/if}

		<div class="batteryOuter">
			<div class="batteryInner"></div>
		</div>
	</div>
{/if}

<style src="./Battery.scss"></style>
