// src/routes/dashboard/+page.ts

import { auth } from '$lib/stores/auth.svelte';
import { redirect } from '@sveltejs/kit';

export async function load() {
	if (!auth.authenticated) {
		throw redirect(303, '/login');
	}
}
