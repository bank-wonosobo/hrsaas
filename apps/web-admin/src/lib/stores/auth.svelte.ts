/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/stores/auth.svelte.ts

import { getCurrent } from '$lib/services/auth';

class AuthStore {
	user = $state<any>(null);
	loading = $state(true);

	get authenticated() {
		return this.user !== null;
	}

	async initialize() {
		try {
			this.user = await getCurrent();
		} catch {
			this.user = null;
		} finally {
			this.loading = false;
		}
	}

	clear() {
		this.user = null;
	}
}

export const auth = new AuthStore();
