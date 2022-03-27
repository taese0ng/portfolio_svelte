<script lang="ts">
	import { onMount } from "svelte";
	import { historyList } from "@constants/histories";

	let widthSetter: HTMLSpanElement, container: HTMLDivElement;
	let width = JSON.parse(localStorage.getItem("history_sidebar_width")) || 200,
		isClicked = false;
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

	onMount(() => {
		widthSetter.addEventListener("mousedown", onMouseDown);
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	});

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
			} else if (sideBarWidth >= 450) {
				width = 450;
			} else {
				width = sideBarWidth;
			}
		}
	};

	const handleClickYear = (year: number) => {
		selectedYear = year;
	};
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

		<span bind:this="{widthSetter}" class="widthSetter"></span>
	</div>
	<div class="bodyWrapper">
		<div class="header">히스토리</div>
		<div class="body">
			<ul class="histories">
				{#each historyList as history}
					{#if history.from.getFullYear() === selectedYear}
						<li class="history">
							<div class="history__title">{history.title}</div>
							<div class="history__content">{history.content}</div>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</div>

<style src="./History.scss"></style>
