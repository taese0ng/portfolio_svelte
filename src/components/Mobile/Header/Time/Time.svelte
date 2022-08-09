<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	export let blackMode = false;
	let hour = "",
		min = "";

	let interval: NodeJS.Timeout;

	const setTime = () => {
		const dateObj = new Date(),
			tempHour = dateObj.getHours() % 12 || 12,
			tempMin = dateObj.getMinutes();

		hour = tempHour > 9 ? String(tempHour) : `0${tempHour}`;
		min = tempMin > 9 ? String(tempMin) : `0${tempMin}`;
	};

	onMount(() => {
		setTime();
		interval = setInterval(setTime, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="time" class:blackMode>{hour}:{min}</div>

<style src="./Time.scss"></style>
