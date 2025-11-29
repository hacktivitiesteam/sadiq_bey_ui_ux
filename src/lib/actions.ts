'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_TOKEN_COOKIE } from './constants';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

// This function is for the admin login
export async function login(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  
  // In a real app, you'd use a more secure way to store and check the admin password.
  // For this prototype, we're hardcoding it.
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin2025';

  if (password !== ADMIN_PASSWORD) {
    return { error: 'Yanlış parol.' };
  }

  // If the password is correct, set a secure cookie.
  // For simplicity, we use a static value. In a real app, this would be a JWT or session token.
  cookies().set(AUTH_TOKEN_COOKIE, 'admin-logged-in', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { error: null };
}

export async function logout() {
  cookies().delete(AUTH_TOKEN_COOKIE);
  // No need to redirect here, the client will handle it.
}
