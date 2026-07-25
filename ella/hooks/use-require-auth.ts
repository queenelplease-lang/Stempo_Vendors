import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/lib/store/hooks';

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  return { isAuthenticated, currentUser };
}
