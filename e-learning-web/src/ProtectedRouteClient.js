import { Navigate, Outlet } from "react-router-dom";
import { LOCAL_STORAGE_KEY, PAGE_LOCATION, USER_ROLE } from "./define/define";
import { checkUserWithRoles, getToken, hasData } from "./helper/utils";
import Page404 from "./page/error/404";
import { hasUnsavedChangesStore } from "./store/HasUnsavedChangesStore";

const ProtectedRouteClient = () => {
  const token = getToken(!document.location.pathname.startsWith(PAGE_LOCATION.LOGIN));
  if (!hasData(token)) {
    if (!document.location.pathname.startsWith(PAGE_LOCATION.LOGIN))  
      sessionStorage.setItem(LOCAL_STORAGE_KEY.BEFORE_URL, document.location.pathname)
  }
  return hasData(token)
    ? (checkUserWithRoles([USER_ROLE.USER]) ? <Outlet /> : <Page404 />)
    : <Navigate to={PAGE_LOCATION.LOGIN} replace />;
};

export default ProtectedRouteClient;