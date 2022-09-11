<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	import type { History } from "@interfaces/history";
	import { historyList } from "@constants/history";

	const clockIcon = "./images/icons/clock.png";
	let openedList = [];

	const years = historyList
		.filter(
			(history, idx, originList) =>
				idx ===
				originList.findIndex(
					(item) => item.from.getFullYear() === history.from.getFullYear(),
				),
		)
		.map((history) => history.from.getFullYear());

	const handleClickYear = (year: number) => {
		const hasValue = Boolean(openedList.find((list) => list === year));

		if (hasValue) {
			openedList = openedList.filter((list) => list !== year);
		} else {
			openedList = [...openedList, year];
		}
	};

	const getHistoryContents = (year: number) => {
		const history = historyList.filter(
			(history) => history.from.getFullYear() === year,
		);

		return history;
	};

	const getDate = (history: History) => {
		const year = history.from.getFullYear();
		const month = history.from.getMonth() + 1;
		return `${year}-${month < 10 ? `0${month}` : month}`;
	};
</script>

<Layout title="히스토리">
	<ul class="wrapper">
		{#each years as year}
			<li class="item__wrapper">
				<div class="year" on:click="{() => handleClickYear(year)}">
					<div
						class="year__icon"
						class:clicked="{Boolean(openedList.find((list) => list === year))}"
					></div>
					<span>{year} 년</span>
				</div>
				<ul
					class="histories"
					class:opened="{Boolean(openedList.find((list) => list === year))}"
				>
					{#each getHistoryContents(year) as history}
						<li class="histories__item">
							<div class="histories__item--label"></div>
							<div class="histories__item--title">{history.title}</div>
							<div class="histories__item--date">
								<img src="{clockIcon}" alt="clock" />{getDate(history)}
							</div>
							<div class="histories__item--content">
								{history.content}
							</div>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
</Layout>

<style src="./History.scss"></style>
