<script lang="ts">
	import { skillList } from "@constants/skills";
</script>

<div class="container">
	<ul class="wrapper">
		{#each skillList as skill}
			<li class="skill">
				<img src="{skill.src}" alt="{skill.title}" />
				<div>{skill.title}</div>
			</li>
		{/each}
	</ul>
</div>

<style src="./Skill.scss"></style>
