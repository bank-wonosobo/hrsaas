import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  validateStatus: () => true,
  // Token dikirim sendiri melalui interceptor. Jangan kirim cookie native
  // juga karena iOS dapat menggabungkannya menjadi dua nilai token.
  withCredentials: false,
});

// React Native tidak selalu mempertahankan HttpOnly cookie setelah aplikasi
// ditutup. Kirim ulang token yang tersimpan sebagai cookie agar API tetap
// dapat mengautentikasi request setelah app dibuka kembali.
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");

  if (token) {
    const normalizedToken = token.split(",token=", 1)[0];
    config.headers.set("Cookie", `token=${normalizedToken}`);
  }

  return config;
});
