import axios from 'axios';
import { getToken, handlerLogoutSuccess, hasRole } from '../helper/utils';
import { toast } from 'react-toastify';
import { loadingStore } from "../store/LoadingStore";
import { refresh } from '../service/AuthService';
import { LOCAL_STORAGE_KEY, PAGE_LOCATION, USER_ROLE } from '../define/define';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { hasUnsavedChangesStore } from '../store/HasUnsavedChangesStore';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 10000
});

let isRefreshing = false;
let refreshPromise = null;

// Thêm interceptor vào request để kiểm tra và làm mới token nếu cần
axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.skipLoading) 
      loadingStore.set(true);
    let token = getToken();
    if (token) {
      const tokenExpiration = jwtDecode(token).exp;
      const currentTime = Date.now() / 1000;
      const timeRemaining = tokenExpiration - currentTime;

      // Token còn dưới 10p hết hạn
      if (timeRemaining < 10 * 60) {

        // Nếu KHÔNG có refresh đang chạy → bắt đầu refresh
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = refresh(token)
            .then(response => {
              const newToken = response.data.data.token;
              localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, newToken);
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        // Các request khác đợi refresh xong
        try {
          token = await refreshPromise;
        } catch {}
      }

      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  }
);

// Thêm interceptor cho response
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu thành công thì trả về response như bình thường
    loadingStore.set(false);
    return response;
  },
  async (error) => {
    console.log(error, error.code)
    loadingStore.set(false);
    // Nếu lỗi liên quan đến xác thực (ví dụ token hết hạn)
    if (error?.response?.status === 401) {
      const code = String(error?.response?.data?.code);
      if (code === String(process.env.REACT_APP_AUTHENTICATED_ERROR_CODE)) {
        hasUnsavedChangesStore.set(false);
        const roleAdmin = !!hasRole(USER_ROLE.ADMIN);
        handlerLogoutSuccess();
        sessionStorage.setItem(LOCAL_STORAGE_KEY.MESSAGE, JSON.stringify({type: 'warning', message: 'Vui lòng đăng nhập lại'}));
        sessionStorage.setItem(LOCAL_STORAGE_KEY.BEFORE_URL, document.location.pathname);
        document.location = roleAdmin === true ? PAGE_LOCATION.LOGIN_ADMIN : PAGE_LOCATION.LOGIN;
        return;
      } else if (code === String(process.env.REACT_APP_AUTHORIZED_ERROR_CODE))
        toast.error('Bạn không có quyền truy cập chức năng này')
      else 
        toast.error(error?.response?.data?.message || 'Bạn không có quyền truy cập chức năng này');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Lỗi kết nối: Server mất quá nhiều thời gian để phản hồi');
    } else if (error.config?.showError !== false)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    // Nếu là lỗi khác thì trả về reject để nơi gọi tự xử lý
    return Promise.reject(error);
  }
);

export default axiosInstance;
