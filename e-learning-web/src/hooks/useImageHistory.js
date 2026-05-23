// src/hooks/useImageHistory.js
import { useState, useRef } from 'react';

/**
 * Simple undo history for image snapshots.
 * Each snapshot stores the image src + all editor state at that moment.
 */
const useImageHistory = () => {
  const [history, setHistory] = useState([]);   // array of snapshots
  const [index, setIndex]     = useState(-1);   // current position

  const canUndo = index >= 0;

  /**
   * Push a new snapshot BEFORE a destructive action (crop, etc.)
   * snapshot = { src, w, h, adj, rotate, flipH, flipV }
   */
  const push = (snapshot) => {
    setHistory(prev => [...prev.slice(0, index + 1), snapshot]);
    setIndex(i => i + 1);
  };

  /**
   * Pop the last snapshot and return it.
   * Caller is responsible for applying the returned state.
   */
  const pop = () => {
    if (!canUndo) return null;
    const snap = history[index];
    setIndex(i => i - 1);
    return snap;
  };

  const clear = () => { setHistory([]); setIndex(-1); };

  return { push, pop, clear, canUndo };
};

export default useImageHistory;
