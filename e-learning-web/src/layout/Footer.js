import { PAGE_LOCATION, USER_ROLE } from "../define/define";
import { checkUserWithRoles } from "../helper/utils";

const Footer = ({}) => {
    return <footer className="bg-neutral-primary-soft rounded-base shadow-xs border-t border-default bg-white">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between flex-col xs:flex-row flex-wrap">
                <a href={checkUserWithRoles([USER_ROLE.ADMIN]) ? PAGE_LOCATION.ADMIN : PAGE_LOCATION.HOME} className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                    <img src="/logo128.png" className="h-7" alt="Logo" />
                    <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">
                        {checkUserWithRoles([USER_ROLE.ADMIN]) ? process.env.REACT_APP_MANAGEMENT_NAME : process.env.REACT_APP_NAME}
                    </span>
                </a>
                <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-body sm:mb-0">
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Về chúng tôi</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Chính sách bảo mật</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Giấy phép hoạt động</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Liên hệ</a>
                    </li>
                </ul>
            </div>
            <hr className="my-6 border-default sm:mx-auto lg:my-8" />
            <span className="block text-sm text-body text-center">© 2026. All Rights Reserved.</span>
        </div>
    </footer>
}

export default Footer;