<script lang="ts">
	import { onMount } from "svelte";
	import { projectList } from "~/constants/project";
	import type { Project } from "@interfaces/project";

	const clockIcon = "./images/icons/clock.png";
	const githubIcon = "./images/icons/githubBtn.png";

	let widthSetter: HTMLSpanElement,
		container: HTMLDivElement,
		cardList: HTMLUListElement,
		width = JSON.parse(localStorage.getItem("project_sidebar_width")) || 200,
		isClicked = false,
		selectedProject: Project = projectList[0];

	const onMouseDown = () => {
		isClicked = true;
	};

	const onMouseUp = () => {
		isClicked = false;
		localStorage.setItem("project_sidebar_width", JSON.stringify(width));
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

	const handleClickTitle = (project: Project) => {
		cardList.scroll({ top: 0, behavior: "smooth" });
		selectedProject = project;
	};

	const handleClickUrl = (url: string) => {
		window.open(url);
	};

	const getDate = (project: Project) => {
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

	onMount(() => {
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	});
</script>

<div bind:this="{container}" class="container">
	<div class="sideBarWrapper">
		<div
			class="sideBar"
			style="
				--width:{`${width}px`}
			"
		>
			<div class="sideBar__category">프로젝트</div>
			<ul class="sideBar__list">
				{#each projectList as project}
					<li
						on:click="{() => handleClickTitle(project)}"
						class="sideBar__list__item"
						class:focus="{selectedProject.id === project.id}"
					>
						{project.title}
					</li>
				{/each}
			</ul>
		</div>

		<span
			bind:this="{widthSetter}"
			on:mousedown="{onMouseDown}"
			class="widthSetter"></span>
	</div>
	<div class="bodyWrapper">
		<div class="header">프로젝트</div>
		<div class="body">
			<ul bind:this="{cardList}" class="cards">
				<li class="card">
					<div class="card__color"></div>
					<div class="card__wrapper row">
						<img
							class="card__wrapper--icon"
							src="{selectedProject.icon}"
							alt="projectIcon"
						/>
						<div>
							<div class="card__wrapper--title">
								{selectedProject.title}
								<div class="card__wrapper--subTitle">
									{selectedProject.subTitle}
								</div>
							</div>

							<div class="card__wrapper--date">
								<img src="{clockIcon}" alt="clock" />{getDate(selectedProject)}
							</div>
						</div>

						<ul class="card__wrapper--links">
							{#if selectedProject.githubUrl}
								<li
									class="card__wrapper--github"
									on:click="{() => handleClickUrl(selectedProject.githubUrl)}"
								>
									<img src="{githubIcon}" alt="githubBtn" />
								</li>
							{/if}
							{#if selectedProject.url}
								<li
									class="card__wrapper--url"
									on:click="{() => handleClickUrl(selectedProject.url)}"
								>
									구경하기
								</li>
							{/if}
						</ul>
					</div>
				</li>

				<li class="card">
					<div class="card__color"></div>
					<div class="card__wrapper">
						<div class="card__wrapper--title">Project Position</div>
						<div class="tag">
							{selectedProject.position}
						</div>
					</div>
				</li>

				<li class="card">
					<div class="card__color"></div>
					<div class="card__wrapper">
						<div class="card__wrapper--title">Skills</div>
						<ul class="card__wrapper--skills">
							{#each selectedProject.skills as skill}
								<li class="tag">{skill}</li>
							{/each}
						</ul>
					</div>
				</li>

				<li class="card">
					<div class="card__color"></div>
					<div class="card__wrapper">
						<div class="card__wrapper--title">Explanation</div>
						<ul class="card__wrapper--contents">
							{#each selectedProject.explanations as explanation}
								<li>⦁ {explanation}</li>
							{/each}
						</ul>
					</div>
				</li>

				<li class="card">
					<div class="card__color"></div>
					<div class="card__wrapper">
						<div class="card__wrapper--title">Images</div>
						<ul class="card__wrapper--images">
							{#each selectedProject.imgs as img}
								<li><img src="{img}" alt="{img}" /></li>
							{/each}
						</ul>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>

<style src="./Project.scss"></style>
