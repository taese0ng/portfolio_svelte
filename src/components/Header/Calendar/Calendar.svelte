<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	const dayList = ["일", "월", "화", "수", "목", "금", "토"];

	let year = 0,
		month = 0,
		todate = 0,
		dateList: Array<Array<number>> = [],
		selectedDate = 0;

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
		const date = new Date();
		year = date.getFullYear();
		month = date.getMonth() + 1;
		todate = date.getDate();

		date.setDate(1);
		const startDay = date.getDay();
		const startDate = date.getDate() - startDay;

		date.setMonth(month);
		date.setDate(0);
		const lastDate = date.getDate();

		dateList = makeDayList(startDate, lastDate);
	};

	const handleClickDate = (date: number) => {
		selectedDate = date;
	};

	onMount(() => {
		const date = new Date();

		init();
		interval = setInterval(() => {
			todate = date.getDate();
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div>
	<div class="header">
		<div class="title">{month}월 {year}</div>
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
							class:today="{todate === date}"
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
