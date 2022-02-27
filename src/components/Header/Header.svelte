<script lang="ts">
	import { onMount } from "svelte";
	const logoImg = "/images/logo.png";

	let midday = "",
		hour = 0,
		min = "",
		sec = "",
		day = "",
		month = 0,
		date = 0;

	const setTime = () => {
		const dayList = ["일", "월", "화", "수", "목", "금", "토"],
			dateObj = new Date(),
			tempHour = dateObj.getHours(),
			tempMin = dateObj.getMinutes(),
			tempSec = dateObj.getSeconds();

		month = dateObj.getMonth() + 1;
		date = dateObj.getDate();
		day = dayList[dateObj.getDay()];
		midday = tempHour > 11 ? "오후" : "오전";
		hour = tempHour % 12 || 12;
		min = tempMin > 9 ? String(tempMin) : `0${tempMin}`;
		sec = tempSec > 9 ? String(tempSec) : `0${tempSec}`;
	};

	onMount(() => {
		setTime();
		setInterval(setTime, 1000);
	});
</script>

<div class="container">
	<div class="left">
		<img src="{logoImg}" alt="logo" width="17" height="17" />
	</div>

	<div class="right">
		<div class="time">
			٩(◕‿◕｡)۶ {month}월 {date}일 ({day}) {midday}
			{hour}:{min}:{sec}
		</div>
	</div>
</div>

<style src="./Header.scss"></style>
