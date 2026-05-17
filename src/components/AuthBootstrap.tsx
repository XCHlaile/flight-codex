import { useEffect } from 'react';
import { getCurrentSession } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setReady = useAuthStore((state) => state.setReady);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    void getCurrentSession()
      .then((session) => setSession(session))
      .catch(() => clearSession());
  }, [token, setSession, clearSession, setReady]);

  return null;
}
