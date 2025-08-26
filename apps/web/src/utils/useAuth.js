import { useCallback } from 'react';

function useAuth() {
  const signInWithCredentials = useCallback(async (options) => {
    const { email, password, callbackUrl = '/dashboard', redirect = true } = options;

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Authentication failed');
    }

    if (redirect && typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    }

    return result;
  }, []);

  const signUpWithCredentials = useCallback(async (options) => {
    // For demo purposes, sign up is the same as sign in
    return signInWithCredentials(options);
  }, [signInWithCredentials]);

  const signOut = useCallback(async () => {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    if (response.ok && typeof window !== 'undefined') {
      window.location.href = '/account/signin';
    }
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signOut,
  };
}

export default useAuth;