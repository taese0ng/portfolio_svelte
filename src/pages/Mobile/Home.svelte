<script lang="ts">
	import Dock from "@components/Mobile/Dock";
	import { mobileImgs } from "@constants/bgSetting";

	const bgImg = mobileImgs[0].thumb;
</script>

<div class="container">
	<img src="{bgImg}" alt="bgImg" class="bgImg" draggable="false" />
	<div>header</div>
	<Dock />
</div>

<style src="./Home.scss"></style>
