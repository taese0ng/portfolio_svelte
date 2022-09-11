<script lang="ts">
	import { afterUpdate } from "svelte";
	import { replace } from "svelte-spa-router";
	import Layout from "@components/Mobile/Layout";
	import { Card } from "@components/shared";
	import { projectList } from "@constants/project";
	import type { Project } from "@interfaces/project";

	const clockIcon = "./images/icons/clock.png";
	const githubIcon = "./images/icons/githubBtn.png";

	export let params = { id: "" };
	let hasLink = false;
	let project: Project | null = null;

	const getDate = () => {
		const startAt = project.startAt;
		const endAt = project.endAt;
		const startYear = startAt.getFullYear();
		const startMonth = startAt.getMonth() + 1;
		const endYear = endAt.getFullYear();
		const endMonth = endAt.getMonth() + 1;
		const startDate = `${startYear}.${
			startMonth > 10 ? startMonth : `0${startMonth}`
		}`;
		const endDate = `${endYear}.${endMonth > 10 ? endMonth : `0${endMonth}`}`;

		return `${startDate} - ${endDate}`;
	};

	const handleClickUrl = (url: string) => {
		window.open(url, "_target");
	};

	afterUpdate(() => {
		project = projectList.find((project: Project) => project.id === params.id);
		if (!project) {
			replace("/projects");
		} else {
			hasLink = Boolean(project.url || project.githubUrl);
		}
	});
</script>

{#if project}
	<Layout title="{params.id}">
		<div class="wrapper">
			<Card>
				<div class="mainInfo">
					<img
						class="mainInfo__icon"
						src="{project.icon}"
						alt="{project.title}"
					/>
					<div class="mainInfo__contents">
						<div class="title">{project.title}</div>
						<div class="subTitle">{project.subTitle}</div>
						<div class="mainInfo__contents--date">
							<img src="{clockIcon}" alt="clock" />
							<span>{getDate()}</span>
						</div>
					</div>
				</div>
			</Card>

			{#if hasLink}
				<Card>
					<div class="link">
						<div class="title">Links</div>
						<ul class="link__contents">
							{#if project.githubUrl}
								<li
									on:click="{() => handleClickUrl(project.githubUrl)}"
									class="link__contents--git"
								>
									<img src="{githubIcon}" alt="github" />
								</li>
							{/if}
							{#if project.url}
								<li
									on:click="{() => handleClickUrl(project.url)}"
									class="link__contents--url"
								>
									구경하기
								</li>
							{/if}
						</ul>
					</div>
				</Card>
			{/if}

			<Card>
				<div class="position">
					<div class="title">Project Positions</div>
					<ul class="tags">
						{#each project.positions as position}
							<li class="tag">{position}</li>
						{/each}
					</ul>
				</div>
			</Card>

			<Card>
				<div class="skill">
					<div class="title">Skills</div>
					<ul class="tags">
						{#each project.skills as skill}
							<li class="tag">{skill}</li>
						{/each}
					</ul>
				</div>
			</Card>

			<Card>
				<div class="explanation">
					<div class="title">Explanation</div>
					<ul class="explanation__contents">
						{#each project.explanations as explanation}
							<li class="explanation__contents--item">{explanation}</li>
						{/each}
					</ul>
				</div>
			</Card>

			<Card>
				<div class="images">
					<div class="title">Images</div>
					<ul class="images__contents">
						{#each project.imgs as img}
							<li class="images__contents--item">
								<img src="{img}" alt="{img}" />
							</li>
						{/each}
					</ul>
				</div>
			</Card>
		</div>
	</Layout>
{/if}

<style src="./ProjectDetail.scss"></style>
