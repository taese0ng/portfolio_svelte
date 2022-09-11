<script lang="ts">
	import { onMount } from "svelte";
	import { Card } from "@components/shared";
	import { historyList } from "~/constants/history";
	import type { History } from "@interfaces/history";

	const clockIcon = "./images/icons/clock.png";

	let bodyWidth: number,
		container: HTMLDivElement,
		width = JSON.parse(localStorage.getItem("history_sidebar_width")) || 200,
		isClicked = false,
		histories: Array<History> = [];

	const years = historyList
		.filter(
			(history, idx, originList) =>
				idx ===
				originList.findIndex(
					(item) => item.from.getFullYear() === history.from.getFullYear(),
				),
		)
		.map((history) => history.from.getFullYear());
	let selectedYear: number = years[0];

	const onMouseDown = () => {
		isClicked = true;
	};

	const onMouseUp = () => {
		isClicked = false;
		localStorage.setItem("history_sidebar_width", JSON.stringify(width));
	};

	const onMouseMove = (e: MouseEvent) => {
		if (isClicked) {
			const containerLeft = container.getBoundingClientRect().left;
			const sideBarWidth = e.pageX - containerLeft;
			if (sideBarWidth <= 100) {
				width = 100;
			} else if (sideBarWidth < bodyWidth / 2) {
				width = sideBarWidth;
			}
		}
	};

	const getHistoryList = () => {
		histories = historyList.filter(
			(history) => history.from.getFullYear() === selectedYear,
		);
	};

	const handleClickYear = (year: number) => {
		selectedYear = year;
		getHistoryList();
	};

	const getDate = (history: History) => {
		const year = history.from.getFullYear();
		const month = history.from.getMonth() + 1;
		return `${year}-${month < 10 ? `0${month}` : month}`;
	};

	onMount(() => {
		getHistoryList();
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	});
</script>

<div bind:this="{container}" class="container">
	<div class="sideBarWrapper">
		<div
			class="sideBar"
			style="
				--width:{`${width}px`}
			"
		>
			<div class="sideBar__category">연도</div>
			<ul class="sideBar__list">
				{#each years as year}
					<li
						on:click="{() => handleClickYear(year)}"
						class="sideBar__list__item"
						class:focus="{selectedYear === year}"
					>
						{year}년
					</li>
				{/each}
			</ul>
		</div>

		<span on:mousedown="{onMouseDown}" class="widthSetter"></span>
	</div>
	<div bind:clientWidth="{bodyWidth}" class="bodyWrapper">
		<div class="header">히스토리</div>
		<div class="body">
			<ul class="histories">
				{#each histories as history}
					<li>
						<Card>
							<div class="history__wrapper">
								<div class="history__wrapper--title">{history.title}</div>
								<div class="history__wrapper--date">
									<img src="{clockIcon}" alt="clock" />{getDate(history)}
								</div>
								<div class="history__wrapper--content">{history.content}</div>
							</div>
						</Card>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style src="./History.scss"></style>
