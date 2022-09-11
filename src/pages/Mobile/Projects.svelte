<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	import { replace } from "svelte-spa-router";
	import { projectList } from "@constants/project";

	const handleClickProject = (projectTitle: string) => {
		replace(`/projects/${projectTitle}`);
	};
</script>

<Layout title="프로젝트">
	<ul class="projects">
		{#each projectList as project}
			<li
				class="projects__item"
				on:click="{() => handleClickProject(project.title)}"
			>
				<img
					class="projects__item--icon"
					src="{project.icon}"
					alt="{project.title}"
				/>
				<div class="projects__item--title">{project.title}</div>
			</li>
		{/each}
	</ul>
</Layout>

<style src="./Projects.scss"></style>
