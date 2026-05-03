import { useEffect } from 'react';
import { useBlocker, useBeforeUnload } from 'react-router-dom';

export function usePrompt(message, when, more) {
  const blocker = useBlocker(when);

  useBeforeUnload(
    useEffect(() => {
      if (!when) return;
      const handler = (e) => {
        if (more && !more()) return;
        e.preventDefault();
        e.returnValue = message;
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }, [when, message])
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (more && !more()) {
        blocker.proceed();
        return;
      }
      const confirm = window.confirm(message);
      if (confirm) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);
}