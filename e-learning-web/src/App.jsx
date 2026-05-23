import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { loadingStore } from './store/LoadingStore';
import { LOCAL_STORAGE_KEY } from './define/define';
import { hasData } from './helper/utils';
import { Loading } from './comp/Loading';
import PopupImageViewer from './comp/PopupImageViewer';
import { hasUnsavedChangesStore } from './store/HasUnsavedChangesStore';
import { usePrompt } from './include/usePrompt';

function App() {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  usePrompt('Bạn có thay đổi chưa lưu. Rời trang?', hasUnsavedChanges, hasUnsavedChangesStore.get);

  useEffect(() => {
    loadingStore.register(setLoading);
    hasUnsavedChangesStore.register(setHasUnsavedChanges);

    const toastMessage = sessionStorage.getItem(LOCAL_STORAGE_KEY.MESSAGE);
    if (toastMessage) {
      let toastObj = {};
      try {
        toastObj = JSON.parse(toastMessage);
      } catch { }

      if (hasData(toastObj.message)) {
        toast[toastObj.type || 'info'](toastObj.message);
      }

      sessionStorage.removeItem(LOCAL_STORAGE_KEY.MESSAGE);
    }
  }, []);

  return (
    <>
      <Outlet />
      <ToastContainer position="bottom-right" autoClose={3000} limit={3} />
      <Loading loading={loading} />
    </>
  );
}

export default App;