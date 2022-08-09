<script lang="ts">
	import Time from "./Time";
	import Battery from "@components/shared/Battery/Battery.svelte";

	export let blackMode = false;
</script>

<div class="container">
	<div class="wrapper">
		<Time blackMode="{blackMode}" />
		<Battery onPercent blackMode="{blackMode}" />
	</div>
</div>

<style src="./Header.scss"></style>
