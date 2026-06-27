import { useSortable } from "@dnd-kit/sortable";
import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LESSON_TYPE } from "../define/define";

function SortableLessonItem({ lessonItem, lesson, setLesson, removeLesson }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lessonItem.id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
            : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    const lessonType = Object.values(LESSON_TYPE).find(item => item.id === lessonItem.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`lesson-item ${lesson?.id === lessonItem.id ? 'active' : ''}`}
            onClick={() => { if (lesson?.id === lessonItem.id) return; setLesson(lessonItem); }}
        >
            <div className="li-type-dot" style={{ background: lessonType?.bg }}>
                <FontAwesomeIcon icon={lessonType?.icon} />
            </div>
            <span className="li-name">{lessonItem.name || lessonItem.id}</span>

            <button type="button" onClick={e => {e.stopPropagation(); removeLesson()}}>
                <FontAwesomeIcon icon={faTrash} className="text-red-500 hover:opacity-60" />
            </button>

            <FontAwesomeIcon
                icon={faGripVertical}
                className="li-drag cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            />
        </div>
    );
}

export default SortableLessonItem;