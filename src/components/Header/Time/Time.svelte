<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	export let onOpenCalendar: () => void;

	let midday = "",
		hour = "",
		min = "",
		sec = "",
		day = "",
		month = 0,
		date = 0;

	let interval: NodeJS.Timeout;

	const setTime = () => {
		const dayList = ["일", "월", "화", "수", "목", "금", "토"],
			dateObj = new Date(),
			tempHour = dateObj.getHours() % 12 || 12,
			tempMin = dateObj.getMinutes(),
			tempSec = dateObj.getSeconds();

		month = dateObj.getMonth() + 1;
		date = dateObj.getDate();
		day = dayList[dateObj.getDay()];
		midday = tempHour > 11 ? "오후" : "오전";
		hour = tempHour > 9 ? String(tempHour) : `0${tempHour}`;
		min = tempMin > 9 ? String(tempMin) : `0${tempMin}`;
		sec = tempSec > 9 ? String(tempSec) : `0${tempSec}`;
	};

	onMount(() => {
		setTime();
		interval = setInterval(setTime, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="time" on:click="{onOpenCalendar}">
	٩(◕‿◕｡)۶ {month}월 {date}일 ({day}) {midday}
	{hour}:{min}:{sec}
</div>

<style src="./Time.scss"></style>
