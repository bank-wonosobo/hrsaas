import { API_URL } from '$env/static/private';
import axios from 'axios';

// cookieHeader contoh: "session=abc123"
export function createApi(cookieHeader?: string) {
	return axios.create({
		baseURL: API_URL,
		timeout: 10_000,
		headers: cookieHeader ? { Cookie: cookieHeader } : {}
	});
}
