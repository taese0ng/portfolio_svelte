<script lang="ts">
	const iconUrl = "./images/icons";
	const imgUrl = `${iconUrl}/profileImg.jpeg`,
		calendarImg = `${iconUrl}/calendar.png`,
		githubImg = `${iconUrl}/github.png`,
		emailImg = `${iconUrl}/email.png`,
		velogImg = `${iconUrl}/velog.png`,
		instagramImg = `${iconUrl}/instagram.png`;

	const githubHref = "https://github.com/taese0ng",
		mainHref = "mailto:taese0ng@naver.com",
		velogHref = "https://velog.io/@taese0ng",
		instagramHref = "https://www.instagram.com/taese0_0ng/";
</script>

<div class="container">
	<div class="profile__img">
		<img src="{imgUrl}" alt="profileImg" />
	</div>

	<ul class="profile__contents">
		<li class="profile__contents--name">
			<div>김태성</div>
		</li>

		<li>
			<img class="profile__contents--icon" src="{calendarImg}" alt="calendar" />
			<span>1996-08-26</span>
		</li>

		<li>
			<a href="{githubHref}" target="_blank">
				<img class="profile__contents--icon" src="{githubImg}" alt="github" />
				<span>GitHub</span>
			</a>
		</li>

		<li>
			<a href="{mainHref}" target="_top">
				<img class="profile__contents--icon" src="{emailImg}" alt="email" />
				<span>Email</span>
			</a>
		</li>

		<li>
			<a href="{velogHref}" target="_blank">
				<img class="profile__contents--icon" src="{velogImg}" alt="velog" />
				<span>Velog</span>
			</a>
		</li>

		<li>
			<a href="{instagramHref}" target="_blank">
				<img
					class="profile__contents--icon"
					src="{instagramImg}"
					alt="instagram"
				/>
				<span>Instagram</span>
			</a>
		</li>
	</ul>
</div>

<style src="./Info.scss"></style>
