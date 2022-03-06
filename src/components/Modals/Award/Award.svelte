<script lang="ts">
	import { awardList } from "@constants/awards";
</script>

<div class="container">
	<ul class="wrapper">
		{#each awardList as award}
			<li class="item">
				<img class="item__img" src="{award.thumb}" alt="{award.title}" />
				<div class="item__title">{award.title} ({award.class})</div>
			</li>
		{/each}
	</ul>
</div>

<style src="./Award.scss"></style>
