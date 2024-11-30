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
  }
);

axiosInterceptors.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("AccessToken");
    }
    console.error("this error is ", error);
    return Promise.reject(error);
  }
);

export default axiosInterceptors;
