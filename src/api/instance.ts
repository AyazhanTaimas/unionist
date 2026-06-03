import axios from "axios";
import { getAuthToken } from '@/app/session/authStorage'
import { getLocale } from '@/app/i18n'

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = getLocale()

    return config;
});

export default api;
