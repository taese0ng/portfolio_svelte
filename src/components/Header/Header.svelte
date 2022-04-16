<script lang="ts">
	import Calendar from "~/components/Header/Calendar";
	import Time from "~/components/Header/Time";
	import Battery from "~/components/Header/Battery";
	import type { DockItemType } from "@interfaces/dock";
	import { itemIDs } from "@constants/dock";

	export let itemList: Array<DockItemType>;
	export let onOpenModal: (id: string, nowOpen: boolean) => void;
	export let onUpperModal: (id: string) => void;
	const logoImg = "./images/icons/logo.png";
	let isFocusedPopup = false;
	let isOpenedCalendar = false;

	const handleFocusMenu = () => {
		isFocusedPopup = true;
	};

	const handleBlurMenu = () => {
		setTimeout(() => {
			isFocusedPopup = false;
		}, 100);
	};

	const handleClickMyInfo = () => {
		const item = itemList.find((item) => item.id === itemIDs.myInfo);

		if (!item.isOpen) {
			onOpenModal(item.id, true);
		} else {
			onUpperModal(item.id);
		}
	};

	const handleOpenCalendar = () => {
		isOpenedCalendar = !isOpenedCalendar;
	};
</script>

<div class="container" id="header">
	<div class="left">
		<div class="elementWrapper">
			<div
				class="logoWrapper"
				tabindex="0"
				on:focus="{handleFocusMenu}"
				on:blur="{handleBlurMenu}"
			>
				<img src="{logoImg}" alt="logo" />
			</div>

			{#if isFocusedPopup}
				<ul class="popup menuList">
					<li on:click="{handleClickMyInfo}">김태성에 관하여</li>
				</ul>
			{/if}
		</div>
	</div>

	<div class="right">
		<div class="elementWrapper">
			<div class="element">
				<Battery onPercent="{true}" />
			</div>

			<div class="element">
				<Time onOpenCalendar="{handleOpenCalendar}" />

				{#if isOpenedCalendar}
					<div class="popup calendarWrapper">
						<Calendar />
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style src="./Header.scss"></style>
