<script lang="ts">
	import { beforeUpdate } from "svelte";
	import { replace, querystring } from "svelte-spa-router";
	import Layout from "@components/Mobile/Layout";
	import Popup from "@components/Desktop/Popup";
	import { certificateList } from "@constants/certificates";
	import type { Certificate } from "@interfaces/cerificates";

	const param = "id";
	let selectedCertificate: Certificate | null = null;
	let isOpenPopup = false;

	const handleClickCertificate = (certificate: Certificate) => {
		replace(`/certificate?${param}=${certificate.id}`);
	};

	const handleClosePopup = () => {
		replace("/certificate");
	};

	beforeUpdate(() => {
		const searchParams = new URLSearchParams($querystring);
		const hasParams = searchParams.has(param);

		selectedCertificate = certificateList.find(
			(certificate) => certificate.id === searchParams.get(param),
		);

		if (selectedCertificate && hasParams) {
			isOpenPopup = true;
		} else if (hasParams && !selectedCertificate) {
			selectedCertificate = null;
			isOpenPopup = false;
			replace("/certificate");
		}
	});
</script>

<Layout title="자격증">
	<div class="wrapper">
		<ul class="certificates">
			{#each certificateList as certificate}
				<li class="certificates__item">
					<img
						on:click="{() => handleClickCertificate(certificate)}"
						class="certificates__item--img"
						src="{certificate.thumb}"
						alt="{certificate.title}"
					/>
					<div class="certificates__item--title">{certificate.title}</div>
					<div class="certificates__item--class">- {certificate.class} -</div>
				</li>
			{/each}
		</ul>

		{#if isOpenPopup && selectedCertificate}
			<Popup onClosePopup="{handleClosePopup}">
				<div class="imageWrapper">
					<img
						src="{selectedCertificate.src}"
						alt="{selectedCertificate.title}"
					/>
				</div>
			</Popup>
		{/if}
	</div>
</Layout>

<style src="./Certificate.scss"></style>
