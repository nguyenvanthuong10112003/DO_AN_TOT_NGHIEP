import {
  Navbar,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { faCircleInfo, faCog, faMars, faSignOutAlt, faVenus } from "@fortawesome/free-solid-svg-icons";
import {
  Bars3Icon
} from "@heroicons/react/24/outline";
import { checkUserWithRoles, handlerLogoutSuccess, hasRole } from "../helper/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PAGE_LOCATION, USER_ROLE } from "../define/define";
import { useNavigate } from "react-router-dom";
import { logout } from "../service/AuthService";
import { hasUnsavedChangesStore } from "../store/HasUnsavedChangesStore";

function Header({ toggleSideBar, currentUser }) {
  const navigate = useNavigate();
  const handlerLogout = async () => {
    hasUnsavedChangesStore.set(false);
    const roleAdmin = checkUserWithRoles([USER_ROLE.ADMIN]);
    await logout().catch(_ => { });
    handlerLogoutSuccess();
    navigate(roleAdmin ? PAGE_LOCATION.LOGIN_ADMIN : PAGE_LOCATION.LOGIN)
  }

  return (
    <div className="w-[100vw] fixed top-0 left-0 right-0 h-16 z-20">
      <Navbar className="top-0 max-w-full h-full shadow-none px-7 rounded-none">
        <div className="flex items-center justify-between h-full text-gray-700">
          <div className="flex flex-row items-center cursor-default">
            <button type="button" className="mr-6" onClick={toggleSideBar}>
              <Bars3Icon className="w-8 h-8 stroke-[2]" />
            </button>
            <Typography
              as="a"
              href={checkUserWithRoles([USER_ROLE.ADMIN]) ? PAGE_LOCATION.ADMIN : PAGE_LOCATION.HOME}
              className="cursor-pointer py-1.5 font-bold text-lg"
            >
              {checkUserWithRoles([USER_ROLE.ADMIN]) ? process.env.REACT_APP_MANAGEMENT_NAME : process.env.REACT_APP_NAME}
            </Typography>
          </div>
          <Menu placement="bottom-end">
            <MenuHandler className="hidden sm:block cursor-pointer">
              <div className="cursor-pointer relative flex-row flex">
                <img onClick={e => e.stopPropagation()} className="max-w-none max-h-none w-8 h-8 object-cover rounded-full border border-gray-300" alt="avatar-user" src={currentUser?.avatar || '/img/user.png'} />
              </div>
            </MenuHandler>
            <MenuList className="hidden sm:block p-1 z-20">
              <MenuItem className="text-left text-base px-4 py-2 cursor-default font-semibold flex flex-row items-center space-x-2">
                <span className="w-full max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap block">{currentUser?.fullName}</span>
                {currentUser?.gender instanceof Boolean && <FontAwesomeIcon icon={currentUser.gender === true ? faMars : faVenus} className={`${currentUser.gender === true ? 'text-blue-500' : 'text-pink-500'} ms-2`} />}
              </MenuItem>
              <hr></hr>
              {hasRole(USER_ROLE.USER) && <MenuItem className="text-left text-base px-4 py-2 outline-none hover:bg-gray-100 space-x-2" onClick={() => navigate(PAGE_LOCATION.USER_INFO)}>
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>Thông tin tài khoản</span>
              </MenuItem>}
              <MenuItem className="text-left text-base px-4 py-2 outline-none hover:bg-gray-100 space-x-2">
                <FontAwesomeIcon icon={faCog} />
                <span>Cài đặt</span>
              </MenuItem>
              <MenuItem className="text-left text-base px-4 py-2 outline-none hover:bg-gray-100 space-x-2" onClick={handlerLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Đăng xuất</span>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Navbar>
    </div>
  );
}

export default Header;