import { api } from '$lib/api/client';
import type { LoginForm } from '$lib/schemas/auth';

export async function login(data: LoginForm) {
	const response = await api.post('/_login', data);

	return response.data;
}

export async function getCurrent() {
	const response = await api.get('/users/_current');

	console.log(response.data);
	return response.data;
}
