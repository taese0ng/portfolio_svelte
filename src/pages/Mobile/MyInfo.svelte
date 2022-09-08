<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	import { contents, profileImg } from "@constants/info";

	const handleClickContent = (link: string) => {
		if (link) window.open(link);
	};
</script>

<Layout>
	<div class="wrapper">
		<div class="profile__img__wrapper">
			<img class="profile__img" src="{profileImg}" alt="profileImg" />
		</div>
		<div class="profile__name">김태성</div>

		<ul class="profile__contents">
			{#each contents as content}
				<li
					class="profile__content"
					on:click="{() => handleClickContent(content.link)}"
				>
					<img
						class="profile__contents__icon"
						src="{content.icon}"
						alt="{content.id}"
					/>
					<span class="profile__contents__text" class:link="{content.link}"
						>{content.text}</span
					>
				</li>
			{/each}
		</ul>
	</div>
</Layout>

<style src="./MyInfo.scss"></style>
