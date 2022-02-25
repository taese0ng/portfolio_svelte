<script lang="ts">
	import { onMount } from "svelte";

	let midday = "";
	let hour: number;
	let min = "";
	let day = "";
	let month: number;
	let date: number;

	const setTime = () => {
		const dayList = ["일", "월", "화", "수", "목", "금", "토"];
		const dateObj = new Date();
		const tempHour = dateObj.getHours();
		const tempMin = dateObj.getMinutes();

		month = dateObj.getMonth() + 1;
		date = dateObj.getDate();
		day = dayList[dateObj.getDay()];
		midday = tempHour > 11 ? "오후" : "오전";
		hour = tempHour % 12 || 12;
		min = tempMin > 9 ? String(tempMin) : `0${tempMin}`;
	};

	onMount(() => {
		setTime();
		setInterval(setTime, 1000);
	});
</script>

<div class="container">
	<div class="left"></div>

	<div class="right">
		<div class="time">{month}월 {date}일 ({day}) {midday} {hour}:{min}</div>
	</div>
</div>

<style lang="scss">
	.container {
		z-index: 999999999999999;
		position: absolute;
		background: #00000030;
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		width: 100%;
		height: 23px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: white;
	}

	.left {
		padding-left: 15px;
	}

	.right {
		display: flex;
		align-items: center;
		font-weight: 400;
		padding-right: 15px;
		.time {
			font-size: 0.9rem;
		}
	}
</style>
