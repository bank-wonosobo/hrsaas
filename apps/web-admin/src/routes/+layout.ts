// src/routes/+layout.ts

import { auth } from '$lib/stores/auth.svelte';

export async function load() {
	await auth.initialize();
	return {};
}
