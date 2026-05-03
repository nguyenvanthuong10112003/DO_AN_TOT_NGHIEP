let setHasUnsavedChanges = null;
let currentHasUnsavedChanges = false; 

export const hasUnsavedChangesStore = {
    register(setFn) {
        setHasUnsavedChanges = setFn;
    },
    set(value) {
        if (currentHasUnsavedChanges === value) return;
        
        currentHasUnsavedChanges = value; // cập nhật trạng thái
        setHasUnsavedChanges?.(value); // gọi react setState
    },
    get() {
        return currentHasUnsavedChanges; 
    }
};
