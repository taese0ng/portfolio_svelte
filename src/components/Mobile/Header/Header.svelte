<script lang="ts">
	import Time from "./Time";
	import Battery from "@components/shared/Battery/Battery.svelte";
</script>

<div class="container">
	<div class="wrapper">
		<Time />
		<Battery onPercent />
	</div>
</div>

<style src="./Header.scss"></style>
