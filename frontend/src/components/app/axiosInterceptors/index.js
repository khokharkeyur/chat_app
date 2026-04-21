import axios from "axios";
import Cookies from "js-cookie";

const baseURL = "http://localhost:8080/api";

const axiosInterceptors = axios.create({
  baseURL: baseURL,
});

axiosInterceptors.interceptors.request.use(
  (config) => {
    const token = Cookies.get("AccessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInterceptors.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      ["User not authenticated.", "Invalid token."].includes(
        error.response?.data?.message,
      ) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("RefreshToken");
        if (!refreshToken) {
          Cookies.remove("AccessToken");
          Cookies.remove("RefreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(`${baseURL}/user/refreshToken`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        Cookies.set("AccessToken", newAccessToken, { expires: 1, path: "/" });
        if (newRefreshToken) {
          Cookies.set("RefreshToken", newRefreshToken, {
            expires: 7,
            path: "/",
          });
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInterceptors(originalRequest);
      } catch (refreshError) {
        Cookies.remove("AccessToken");
        Cookies.remove("RefreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInterceptors;
