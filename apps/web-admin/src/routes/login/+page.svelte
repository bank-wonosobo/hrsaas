<script lang="ts">
	import LoginForm from '$lib/features/auth/login-form.svelte';

	let { data } = $props();
</script>

<div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
	<div class="w-full max-w-sm md:max-w-3xl">
		<LoginForm formData={data.form} />
	</div>
</div>
