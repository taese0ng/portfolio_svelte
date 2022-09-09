<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	import { skillList } from "@constants/skills";
</script>

<Layout>
	<ul class="skills">
		{#each skillList as skill}
			<li class="skills__item">
				<img class="skills__item--img" src="{skill.src}" alt="{skill.title}" />
			</li>
		{/each}
	</ul>
</Layout>

<style src="./Skill.scss"></style>
