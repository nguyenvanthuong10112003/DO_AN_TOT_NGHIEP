import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { loadingStore } from './store/LoadingStore';
import { LOCAL_STORAGE_KEY } from './define/define';
import { hasData } from './helper/utils';
import { Loading } from './comp/Loading';
import ImageViewer from './comp/ImageViewer';
import { hasUnsavedChangesStore } from './store/HasUnsavedChangesStore';
import { usePrompt } from './include/usePrompt';

function App() {
  const [loading, setLoading] = useState(false);
  const [imageViewerUrl, setImageViewerUrl] = useState(null);
  const [message, setMessage] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  usePrompt('Bạn có thay đổi chưa lưu. Rời trang?', hasUnsavedChanges, hasUnsavedChangesStore.get);

  // Chạy 1 lần
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

    const handleClick = (e) => {
      const target = e.target;
      if (target.tagName === 'IMG') {
        setImageViewerUrl(target.src);
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handlerCloseImageViewer = () => {
    setImageViewerUrl(null);
  };

  return (
    <>
      <Outlet />
      <ToastContainer position="bottom-right" autoClose={3000} limit={3} />
      <Loading loading={loading} />
      <ImageViewer imageUrl={imageViewerUrl} onClose={handlerCloseImageViewer} />
    </>
  );
}

export default App;