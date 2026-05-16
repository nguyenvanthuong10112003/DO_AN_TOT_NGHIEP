import { ACTION } from "../../../define/define";
import CreateOrUpdate from "./CreateOrUpdate";

const CourseUpdate = () => {
    return <CreateOrUpdate action={ACTION.UPDATE} />
}

export default CourseUpdate;