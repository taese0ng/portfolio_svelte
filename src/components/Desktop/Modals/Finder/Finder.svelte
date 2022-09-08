<script lang="ts">
	import { onMount } from "svelte";

	let widthSetter: HTMLSpanElement, container: HTMLDivElement;
	let width = JSON.parse(localStorage.getItem("finder_sidebar_width")) || 200,
		isClicked = false;

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
		localStorage.setItem("finder_sidebar_width", JSON.stringify(width));
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
</script>

<div bind:this="{container}" class="container">
	<div class="sideBarWrapper">
		<div
			class="sideBar"
			style="
				--width:{`${width}px`}
			"
		>
			SideBar
		</div>

		<span bind:this="{widthSetter}" class="widthSetter"></span>
	</div>
	<div class="bodyWrapper">
		<div class="header">Finder</div>
		<div class="body">Finder</div>
	</div>
</div>

<style src="./Finder.scss"></style>
