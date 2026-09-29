import { dev } from '$app/environment';
import { AUTH_COOKIE } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import { parse } from 'set-cookie-parser';

const raw = (v: string) => v; // jaga nilai cookie tetap persis seperti dari API

// Susun header Cookie untuk dikirim ke API
export function authHeader(cookies: Cookies) {
	const value = cookies.get(AUTH_COOKIE, { decode: raw });
	return value ? `${AUTH_COOKIE}=${value}` : undefined;
}

// Teruskan Set-Cookie dari API ke browser (hanya cookie auth)
export function relaySetCookie(cookies: Cookies, setCookie?: string[] | string) {
	if (!setCookie) return;

	for (const c of parse(setCookie, { map: false, decodeValues: false })) {
		if (c.name !== AUTH_COOKIE) continue;

		cookies.set(c.name, c.value, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			expires: c.expires, // cookie kedaluwarsa dari API (misal saat logout) otomatis terhapus
			maxAge: c.maxAge,
			encode: raw
		});
	}
}
