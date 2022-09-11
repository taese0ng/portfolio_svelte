<script lang="ts">
	import Layout from "@components/Mobile/Layout";
	export let params = { title: "" };

	console.log("test:", params.title);
</script>

<Layout title="{params.title}">
	<div>test</div>
</Layout>
