import React, { useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import {
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../service/AuthService";
import { checkUserWithRoles, handlerLogoutSuccess, hasRole, isBoolean } from "../helper/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faCog, faMars, faSignOutAlt, faVenus } from "@fortawesome/free-solid-svg-icons";
import { PAGE_LOCATION, USER_ROLE } from "../define/define";
import { useNavigate } from "react-router-dom";
import { hasUnsavedChangesStore } from "../store/HasUnsavedChangesStore";

const Sidebar = ({ isOpenSideBar, currentUser }) => {
  const [opens, setOpens] = React.useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setOpens([]);
  }, [isOpenSideBar])
  const handleOpen = (value) => {
    setOpens(prev => {
      let index = prev.findIndex(open => open === value);
      if (index === -1) prev = [...prev, value]
      return prev;
    });
  };
  const handlerClose = (value) => {
    setOpens(prev => {
      return prev.filter(open => open !== value);
    });
  };
  const handlerLogout = async () => {
    hasUnsavedChangesStore.set(false);
    const roleAdmin = checkUserWithRoles([USER_ROLE.ADMIN]);
    await logout().catch(_ => { });
    handlerLogoutSuccess();
    navigate(roleAdmin ? PAGE_LOCATION.LOGIN_ADMIN : PAGE_LOCATION.LOGIN)
  }

  return (
    <Card className={`w-full max-w-full !rounded-none sm:max-w-[20rem] p-4 h-[100vh] pt-16 z-10 fixed top-0 shadow-none border transition-all duration-500 ease-in-out flex-col justify-between ${isOpenSideBar ? 'left-0' : '-left-full'}`}>
      <List className="overflow-auto border-b sm:border-b-0">
        <Accordion
          open={opens.includes(1)}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${opens.includes(1) ? "rotate-180" : ""}`}
            />
          }
        >
          <ListItem className="p-0" selected={opens.includes(1)}>
            <AccordionHeader onClick={() => opens.includes(1) ? handlerClose(1) : handleOpen(1)} className="border-b-0 p-3 hover:bg-gray-100 rounded-lg">
              <ListItemPrefix>
                <PresentationChartBarIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-semibold ml-2">
                Dashboard
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className={`py-1 hidden ${opens.includes(1) && 'block'}`}>
            <List className="p-0">
              <ListItem className="hover:bg-gray-100 rounded-lg">
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="ml-2">
                  Analytics
                </span>
              </ListItem>
              <ListItem className="hover:bg-gray-100 rounded-lg">
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="ml-2">
                  Reporting
                </span>
              </ListItem>
              <ListItem className="hover:bg-gray-100 rounded-lg">
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="ml-2">
                  Projects
                </span>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <Accordion
          open={opens.includes(2)}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform ${opens.includes(2) ? "rotate-180" : ""}`}
            />
          }
        >
          <ListItem className="p-0" selected={opens.includes(2)}>
            <AccordionHeader onClick={() => opens.includes(2) ? handlerClose(2) : handleOpen(2)} className="border-b-0 p-3 hover:bg-gray-100 rounded-lg">
              <ListItemPrefix>
                <ShoppingBagIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-semibold ml-2">
                E-Commerce
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className={`py-1 hidden ${opens.includes(2) && 'block'}`}>
            <List className="p-0">
              <ListItem className="hover:bg-gray-100 rounded-lg">
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="ml-2">
                  Orders
                </span>
              </ListItem>
              <ListItem className="hover:bg-gray-100 rounded-lg">
                <ListItemPrefix>
                  <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                </ListItemPrefix>
                <span className="ml-2">
                  Products
                </span>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <hr className="my-2 border-blue-gray-50" />
        <ListItem className="hover:bg-gray-100 rounded-lg">
          <ListItemPrefix>
            <InboxIcon className="h-5 w-5" />
          </ListItemPrefix>
          <span className="ml-2 font-semibold">
            Inbox
          </span>
          <ListItemSuffix>
            <Chip value="14" size="sm" variant="ghost" color="blue-gray" className="rounded-full" />
          </ListItemSuffix>
        </ListItem>
        <ListItem className="hover:bg-gray-100 rounded-lg">
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          <span className="ml-2 font-semibold">
            Profile
          </span>
        </ListItem>
        <ListItem className="hover:bg-gray-100 rounded-lg">
          <ListItemPrefix>
            <Cog6ToothIcon className="h-5 w-5" />
          </ListItemPrefix>
          <span className="ml-2 font-semibold">
            Settings
          </span>
        </ListItem>
        <ListItem className="hover:bg-gray-100 rounded-lg" onClick={handlerLogout}>
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          <span className="ml-2 font-semibold">
            Log Out
          </span>
        </ListItem>
      </List>
      <div className="flex flex-col bottom-0 w-full justify-center left-0 right-0">
        <Accordion
          open={opens.includes(4)}
          icon={
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`mx-auto h-4 w-4 transition-transform sm:hidden ${opens.includes(4) ? "" : "rotate-180"}`}
            />
          }
        >
          <ListItem className="p-0 sm:hidden" selected={opens.includes(4)}>
            <AccordionHeader onClick={(e) => {e.stopPropagation(); opens.includes(4) ? handlerClose(4) : handleOpen(4)}} className="border-b-0 p-3 hover:bg-gray-100 rounded-lg">
              <ListItemPrefix>
                <img className="max-w-none max-h-none w-8 h-8 object-cover rounded-full border border-gray-300" alt="avatar-user" src={currentUser?.avatar || '/img/user.png'} />
              </ListItemPrefix>
              <Typography color="blue-gray" className="w-full mx-2 font-semibold text-ellipsis overflow-hidden whitespace-nowrap text-left">
                {currentUser?.fullName || currentUser?.username || ''}
              </Typography>
              {isBoolean(currentUser?.gender) && <span>
                <FontAwesomeIcon icon={currentUser.gender === true ? faMars : faVenus} className={`${currentUser.gender === true ? 'text-blue-500' : 'text-pink-500'} mx-2`} />
              </span>}
            </AccordionHeader>
          </ListItem>
          <AccordionBody className={`hidden ${opens.includes(4) && 'block'} sm:hidden`}>
            <List className="p-0">
              {hasRole(USER_ROLE.USER) && <ListItem className="hover:bg-gray-100 border-y rounded-none" onClick={() => navigate(PAGE_LOCATION.USER_INFO)}>
                <FontAwesomeIcon icon={faCircleInfo} /> 
                <span className="ml-2">
                  Thông tin cá nhân
                </span>
              </ListItem>}
              <ListItem className="hover:bg-gray-100 border-b rounded-none">
                <FontAwesomeIcon icon={faCog} />
                <span className="ml-2">
                  Cài đặt
                </span>
              </ListItem>
              <ListItem className="hover:bg-gray-100 rounded-none" onClick={handlerLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="ml-2">
                  Đăng xuất
                </span>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <hr className="my-2"/>
        <div className="flex-row flex mx-4">
          <img src="/logo64.png" alt="brand" />
          <div className="ms-4 font-bold font-sans flex flex-col items-start justify-center">
            <p className="" >{checkUserWithRoles([USER_ROLE.ADMIN]) ? process.env.REACT_APP_MANAGEMENT_NAME : process.env.REACT_APP_NAME}</p>
            {!checkUserWithRoles([USER_ROLE.ADMIN]) && <p >Website</p>}
          </div>
        </div>
      </div>
    </Card>
  );
}


export default Sidebar;