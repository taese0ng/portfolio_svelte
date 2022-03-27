<script lang="ts">
	import { certificateList } from "@constants/certificates";
	import type { Certificate } from "@interfaces/cerificates";
	import Popup from "@components/Popup";

	let isOpenPopup = false;
	let selectedCertificate: Certificate;

	const handleClickItem = (certificate: Certificate) => {
		selectedCertificate = certificate;
		isOpenPopup = true;
	};

	const handleClosePopup = () => {
		isOpenPopup = false;
	};
</script>

<div class="container">
	<ul class="wrapper">
		{#each certificateList as certificate}
			<li class="item" on:click="{() => handleClickItem(certificate)}">
				<img
					class="item__img"
					src="{certificate.thumb}"
					alt="{certificate.title}"
				/>
				<div class="item__title">{certificate.title} ({certificate.class})</div>
			</li>
		{/each}
	</ul>

	{#if isOpenPopup}
		<Popup onClosePopup="{handleClosePopup}" hasCloseBtn>
			<div class="imageWrapper">
				<img
					src="{selectedCertificate.src}"
					alt="{selectedCertificate.title}"
				/>
			</div>
		</Popup>
	{/if}
</div>

<style src="./Certificate.scss"></style>
