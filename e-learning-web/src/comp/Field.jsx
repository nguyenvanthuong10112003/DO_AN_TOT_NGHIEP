import React from "react";
import { hasData, isFunction } from "../helper/utils";

const Field = ({ target, field, editField, tempValue, setTempValue, handleSave, handleCancel, handleEdit }) => {
    return target && field && (
        <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">{field.label} {editField === field.fieldName && field.isRequired && <span className="text-red-500">*</span>}</span>

            <div className="flex items-center justify-between gap-2">
                {editField === field.fieldName ? (
                    field.type === 'radio-button' ? (
                        <div className="flex gap-4">
                            {field.options && field.options.map((option, index) => (
                                <label key={option.value} htmlFor={`${field.fieldName}-${index}`} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={field.fieldName}
                                        id={`${field.fieldName}-${index}`}
                                        value={option.value}
                                        checked={tempValue == option.value}
                                        onChange={(e) => { setTempValue(e.target.value) }}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    ) :
                        (<input
                            type={field.type || "text"}
                            className="flex-1 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={tempValue || ''}
                            onChange={(e) => setTempValue(e.target.value)}
                            required={field.isRequired}
                            maxLength={field.maxLength}
                        />)
                ) : (
                    <span className="w-full truncate">
                        <span className="text-base text-gray-700">{(isFunction(field.displayValue) ? field.displayValue(target[field.fieldName]) : target[field.fieldName]) || 'Không có dữ liệu'}</span>
                    </span>
                )}

                {field.canEdit &&
                    (editField === field.fieldName ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-700 text-sm font-semibold"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                            >
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleEdit(field.fieldName)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                            {hasData(field.fieldName) ? 'Sửa' : 'Thêm'}
                        </button>
                    ))
                }
            </div>
        </div>
    )
};

export default Field;