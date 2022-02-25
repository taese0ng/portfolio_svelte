<script lang="ts">
	const imgUrl = 'url("images/profileImg.jpeg")';
</script>

<div class="wrapper">
	<div class="profile__img" style="--Img:{imgUrl}"></div>

	<ul class="profile__contents">
		<li class="profile__contents--name">
			<div style="text-align: center; width: 100%">김태성</div>
		</li>

		<li>
			<img
				class="profile__contents--icon"
				src="images/calendar.png"
				alt="calendar"
			/>
			1996/08/26
		</li>

		<li>
			<a href="https://github.com/taese0ng" target="_blank">
				<img
					class="profile__contents--icon"
					src="images/github.png"
					alt="github"
				/>
				GitHub
			</a>
		</li>

		<li>
			<a href="mailto:taese0ng@naver.com" target="_top">
				<img
					class="profile__contents--icon"
					src="images/email.png"
					alt="email"
				/>
				Email
			</a>
		</li>

		<li>
			<a href="https://velog.io/@taese0ng" target="_blank">
				<img
					class="profile__contents--icon"
					src="images/velog.png"
					alt="velog"
				/>
				Velog
			</a>
		</li>

		<li>
			<a href="https://www.instagram.com/taese0_0ng/" target="_blank">
				<img
					class="profile__contents--icon"
					src="images/instagram.png"
					alt="instagram"
				/>
				Instagram
			</a>
		</li>
	</ul>
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		align-items: center;
		height: 100%;
		padding: 0 50px;
	}

	.profile__img {
		width: 150px;
		height: 150px;
		border-radius: 100%;
		flex-shrink: 0;
		border: 6px solid transparent;
		background-image: var(--Img), linear-gradient(to top, #a7a7a7, #fff);
		background-origin: border-box;
		background-clip: content-box, border-box;
		background-size: cover;
		box-sizing: border-box;
		box-shadow: 0 6px 15px -7px black;
	}

	.profile__contents {
		display: flex;
		flex-direction: column;
		font-size: 15px;
		width: 100%;
		margin: 0 0 0 60px;
		padding: 0;
		position: relative;
		top: -10px;

		& > li {
			list-style: none;
			margin: 5px 0;
			font-weight: 500;
			display: flex;
			align-items: center;
		}

		& > &--name {
			font-size: 25px;
			font-weight: bold;
			margin-bottom: 20px;
		}

		&--icon {
			width: 20px;
			height: 20px;
			margin-right: 6px;
		}

		& > li > a {
			display: flex;
			align-items: center;
		}
	}
</style>
