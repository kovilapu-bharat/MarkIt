import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AuthService } from '../services/auth';

export const useLogout = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    // Safety fallback: if everything hangs, force navigation after 3 seconds
    const forceTimer = setTimeout(() => {
      setLoggingOut(false);
      router.replace('/');
    }, 3000);

    try {
      setLoggingOut(true);

      // Race the logout against a 1.5-second timeout (improved responsiveness)
      const logoutPromise = AuthService.logout()
        .catch(() => { /* AuthService logout error */ });

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1500));

      await Promise.race([logoutPromise, timeoutPromise]);

      // Cancel the force timer as we are about to navigate normally
      clearTimeout(forceTimer);

      // Add a small delay to ensure state updates settle before navigation
      setTimeout(() => {
        setLoggingOut(false);
        try {
          if (router.canDismiss()) router.dismissAll();
        } catch {
          // ignore
        }
        router.replace('/login');
      }, 100);

    } catch {
      router.replace('/login');
    }
  };

  return { handleLogout, loggingOut };
};
