// TestAuth.jsx
import React from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const TestAuth = () => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('User  signed in:', result.user);
    } catch (error) {
      console.error('Google sign-in error', error);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
};

export default TestAuth;