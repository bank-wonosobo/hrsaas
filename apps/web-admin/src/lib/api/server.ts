// src/lib/api/server.ts

import { API_URL } from '$env/static/private';
import axios from 'axios';

export const serverApi = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

