import { useParams } from "react-router-dom";

const LessonIndex = () => {
    const { id } = useParams();
    console.log(id)
    return 'lesson'
}

export default LessonIndex;