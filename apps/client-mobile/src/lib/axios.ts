import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  validateStatus: () => true,
  withCredentials: true, // Sertakan cookie dalam setiap permintaan
});

// React Native tidak selalu mempertahankan HttpOnly cookie setelah aplikasi
// ditutup. Kirim ulang token yang tersimpan sebagai cookie agar API tetap
// dapat mengautentikasi request setelah app dibuka kembali.
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");

  if (token) {
    config.headers.set("Cookie", `token=${token}`);
  }

  return config;
});
