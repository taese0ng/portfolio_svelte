<script lang="ts">
	import { contents, profileImg } from "@constants/info";

	const handleClickContent = (link: string) => {
		if (link) window.open(link);
	};
</script>

<div class="container">
	<div class="profile__img">
		<img src="{profileImg}" alt="profileImg" />
	</div>

	<ul class="profile__contents">
		<li class="profile__contents--name">
			<div>김태성</div>
		</li>

		{#each contents as content}
			<li
				class:link="{content.link}"
				on:click="{() => handleClickContent(content.link)}"
			>
				<img
					class="profile__contents--icon"
					src="{content.icon}"
					alt="{content.id}"
				/>
				<span>{content.text}</span>
			</li>
		{/each}
	</ul>
</div>

<style src="./Info.scss"></style>
