import { loginSchema } from '$lib/schemas/auth';
import { createApi } from '$lib/server/api';
import { relaySetCookie } from '$lib/server/auth.js';
import { fail, redirect } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async () => {
	return {
		form: await superValidate(zod(loginSchema))
	};
};

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const res = await createApi().post('/_login', form.data);
			relaySetCookie(cookies, res.headers['set-cookie']); // cookie dari API -> browser
		} catch (e) {
			if (isAxiosError(e) && e.response?.status === 401) {
				return setError(form, 'password', 'Username atau password salah');
			}
			return message(form, 'Server bermasalah, coba lagi nanti', { status: 500 });
		}

		throw redirect(303, '/dashboard');
	}
};
