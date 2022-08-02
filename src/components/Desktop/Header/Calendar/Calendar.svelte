<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	const dayList = ["일", "월", "화", "수", "목", "금", "토"];

	let year = 0,
		month = 0,
		todate = 0,
		toMonth = 0,
		toYear = 0,
		dateList: Array<Array<number>> = [],
		selectedDate = 0,
		mainDate = new Date();

	let interval: NodeJS.Timeout;

	const makeDayList = (startDate: number, lastDate: number) => {
		const tempArr: Array<Array<number>> = [];

		for (let i = startDate; i < lastDate; i = i + 7) {
			const tempRow: Array<number> = [];
			for (let j = 0; j < 7; j++) {
				const date = i + j;
				if (date <= lastDate) {
					tempRow.push(date);
				}
			}
			tempArr.push(tempRow);
		}

		return tempArr;
	};

	const init = () => {
		year = mainDate.getFullYear();
		month = mainDate.getMonth() + 1;

		mainDate.setDate(1);
		const startDay = mainDate.getDay();
		const startDate = mainDate.getDate() - startDay;

		mainDate.setMonth(month);
		mainDate.setDate(0);
		const lastDate = mainDate.getDate();

		dateList = makeDayList(startDate, lastDate);
	};

	const handleClickDate = (date: number) => {
		selectedDate = date;
	};

	const handlePrevCalendar = () => {
		const nowMonth = mainDate.getMonth();
		mainDate.setDate(1);
		mainDate.setMonth(nowMonth - 1);
		init();
	};

	const handleNowCalendar = () => {
		mainDate = new Date();
		init();
	};

	const handleNextCalendar = () => {
		const nowMonth = mainDate.getMonth();
		mainDate.setDate(1);
		mainDate.setMonth(nowMonth + 1);
		init();
	};

	const getTodayValue = (date: Date) => {
		toMonth = date.getMonth() + 1;
		toYear = date.getFullYear();
		todate = date.getDate();
	};

	onMount(() => {
		init();

		const date = new Date();
		getTodayValue(date);

		interval = setInterval(() => {
			getTodayValue(date);
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div>
	<div class="header">
		<div class="title">{month}월 {year}</div>

		<div class="controlWrapper">
			<div class="controlBtn" on:click="{handlePrevCalendar}">◁</div>
			<div class="controlBtn" on:click="{handleNowCalendar}">○</div>
			<div class="controlBtn" on:click="{handleNextCalendar}">▷</div>
		</div>
	</div>
	<div class="body">
		<div class="row">
			{#each dayList as day}
				<span class="item">{day}</span>
			{/each}
		</div>

		<div class="dateWrapper">
			{#each dateList as dateRow}
				<div class="row">
					{#each dateRow as date}
						<span
							class="item date"
							class:cursor="{date > 0}"
							class:today="{todate === date &&
								toMonth === month &&
								toYear === year}"
							class:selected="{selectedDate === date && date > 0}"
							on:click="{() => handleClickDate(date)}"
						>
							{date > 0 ? date : ""}
						</span>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style src="./Calendar.scss"></style>
