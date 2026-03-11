import axios from "axios";

export const api = axios.create({
    baseURL: "https://dmsback-production.up.railway.app/api/v1",
});

// 🔐 interceptor — добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// console.log('TOKEN:', response.token)
console.log('LS TOKEN:', localStorage.getItem('token'))
export default api;