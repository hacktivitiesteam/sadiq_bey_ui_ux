'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_TOKEN_COOKIE } from './constants';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
     // This is a server action, so we need to initialize a temporary admin-like app
     // to validate the user. In a real app, you'd use the Admin SDK.
     // For this context, we will use the client SDK on the server.
    const { auth } = initializeFirebase();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // IMPORTANT: This is a simplified example. In a production app,
    // you would get an ID token and set it as a secure, httpOnly cookie.
    // For this prototype, we'll set a simple cookie.
    if (userCredential.user) {
        cookies().set(AUTH_TOKEN_COOKIE, userCredential.user.uid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
        });
        return { error: null, success: true };
    }
     return { error: 'Login failed. Please try again.' };

  } catch (error: any) {
    return { error: error.message || 'An unknown error occurred.' };
  }
}

export async function logout() {
  cookies().delete(AUTH_TOKEN_COOKIE);
  redirect('/login');
}
