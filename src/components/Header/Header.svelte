<script lang="ts">
	import { onMount } from "svelte";
	import type { DockItemType } from "@interfaces/dock";

	export let itemList: Array<DockItemType>;
	export let onOpenModal: (id: string) => void;
	export let onUpperModal: (id: string) => void;
	const logoImg = "/images/logo.png";
	let isFocusedPopup = false;

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

	const handleFocusMenu = () => {
		isFocusedPopup = true;
	};

	const handleBlurMenu = () => {
		setTimeout(() => {
			isFocusedPopup = false;
		}, 100);
	};

	const handleClickMyInfo = () => {
		const item = itemList.find((item) => item.id === "myInfo");

		if (!item.isOpen) {
			onOpenModal(item.id);
		} else {
			onUpperModal(item.id);
		}
	};

	onMount(() => {
		setTime();
		setInterval(setTime, 1000);
	});
</script>

<div class="container">
	<div class="left">
		<div class="menu">
			<div
				class="logoWrapper"
				tabindex="0"
				on:focus="{handleFocusMenu}"
				on:blur="{handleBlurMenu}"
			>
				<img src="{logoImg}" alt="logo" />
			</div>

			{#if isFocusedPopup}
				<ul class="popup">
					<li on:click="{handleClickMyInfo}">김태성에 관하여</li>
				</ul>
			{/if}
		</div>
	</div>

	<div class="right">
		<div class="time">
			٩(◕‿◕｡)۶ {month}월 {date}일 ({day}) {midday}
			{hour}:{min}:{sec}
		</div>
	</div>
</div>

<style src="./Header.scss"></style>
