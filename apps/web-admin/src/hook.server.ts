import { AUTH_COOKIE } from '$env/static/private';
import { createApi } from '$lib/server/api';
import { authHeader, relaySetCookie } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { isAxiosError } from 'axios';

const PUBLIC = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const cookie = authHeader(event.cookies);
	if (cookie) {
		try {
			const res = await createApi(cookie).get('/users/_current');
			event.locals.user = res.data;
			// jika API memperpanjang sesi (sliding), cookie baru ikut diteruskan
			relaySetCookie(event.cookies, res.headers['set-cookie']);
		} catch (e) {
			if (isAxiosError(e) && e.response?.status === 401) {
				event.cookies.delete(AUTH_COOKIE, { path: '/' });
			}
		}
	}

	const path = event.url.pathname;
	const isPublic = PUBLIC.some((p) => path.startsWith(p));
	if (!event.locals.user && !isPublic && !path.startsWith('/api')) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
