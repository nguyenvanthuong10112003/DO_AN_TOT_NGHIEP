import React, { useEffect, useRef, useState } from "react";
import { hasData, isFunction } from "../helper/utils";

const AutocompleteInput = ({ lst, value, setValue, onChange, displayItem, placeholder, getValueItem, classInput, optionShowList }) => {
    const [isShowLst, setIsShowList] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsShowList(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    useEffect(() => {
        if (isShowLst === true) {
            setActiveIndex(0);
        }
    }, [isShowLst])
    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setActiveIndex((prev) => prev + 1 < lst.length ? prev + 1 : 0);
            e.preventDefault();
            return;
        }

        if (e.key === "ArrowUp") {
            setActiveIndex((prev) => prev - 1 >= 0 ? prev - 1 : lst.length - 1);
            e.preventDefault();
            return;
        }

        if (e.key === "Enter" && activeIndex >= 0) {
            const item = lst[activeIndex];
            setValue(getValueItem(item));
            setIsShowList(false);
            e.preventDefault();
            return;
        }
    }
    const inputOnChange = (e) => {
        setIsShowList(true);
        if (isFunction(setValue))
            setValue(e.target.value);
        if (isFunction(onChange))
            onChange(e);
    }
    const onSelectItem = (item) => {
        setIsShowList(false);
        if (isFunction(setValue))
            setValue(getValueItem(item))
    }
    return <div ref={wrapperRef} className="relative w-full">
        <input type="text" onKeyDown={onKeyDown} className={`z-10 relative ${classInput}`} placeholder={placeholder} onChange={inputOnChange} value={displayItem(value)} />
        {isShowLst && optionShowList && <ul className="absolute z-20 mt-2.5 p-1 bg-white border rounded-md w-full max-w-full overflow-auto shadow-md">
            {hasData(lst) && lst.map((item, index) => {
                return <React.Fragment key={index} >
                    {index > 0 && <hr />}
                    <li className={`px-2 py-1 cursor-pointer hover:bg-gray-100 rounded ${activeIndex === index && 'bg-gray-100'}`} onClick={() => onSelectItem(item)}>{displayItem(item)}</li>
                </React.Fragment>
            })}
        </ul>}
    </div>
}

export default AutocompleteInput;