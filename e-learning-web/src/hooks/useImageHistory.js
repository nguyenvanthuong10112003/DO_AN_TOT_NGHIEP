import { useState } from 'react';

const useImageHistory = () => {
  const [history, setHistory] = useState([]);

  const push = snapshot =>
    setHistory(prev => [...prev, snapshot]);

  const pop = () => {
    if (history.length === 0) return null;

    const snap = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    return snap;
  };

  const clear = () => setHistory([]);

  const checkExist = check =>
    history.some(item => check?.(item));

  return {
    push,
    pop,
    clear,
    canUndo: history.length > 0,
    checkExist
  };
};

export default useImageHistory;