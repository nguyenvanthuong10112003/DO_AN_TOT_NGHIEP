import { Navigate, Outlet } from "react-router-dom";
import { PAGE_LOCATION, USER_ROLE } from "./define/define";
import { checkUserWithRoles, getToken } from "./helper/utils";

const UnProtectedRoute = () => {
  return !getToken()
    ? <Outlet />
    : <Navigate to={checkUserWithRoles([USER_ROLE.ADMIN]) ? PAGE_LOCATION.ADMIN : PAGE_LOCATION.HOME} replace />;
};

export default UnProtectedRoute;