let setLoadingExternal = null;
let currentLoading = false; 

export const loadingStore = {
    register(setFn) {
        setLoadingExternal = setFn;
    },
    set(value) {
        if (currentLoading === value) return;
        
        currentLoading = value; // cập nhật trạng thái
        setLoadingExternal?.(value); // gọi react setState
    },
    get() {
        return currentLoading; 
    }
};
