import { ACTION } from "../../../define/define";
import CreateOrUpdate from "./CreateOrUpdate";

const CourseCreate = () => {
    return <CreateOrUpdate action={ACTION.CREATE} />
}

export default CourseCreate;