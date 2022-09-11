<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	import { skillList } from "@constants/skills";
</script>

<Layout title="기술스택">
	<ul class="skills">
		{#each skillList as skill}
			<li class="skills__item">
				<img class="skills__item--img" src="{skill.src}" alt="{skill.title}" />
			</li>
		{/each}
	</ul>
</Layout>

<style src="./Skills.scss"></style>
