import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCcOLZhTOuQLhq2xoYfhkNTCe_ieR_32ew',
  authDomain: 'smart-study-assistant-5c45b.firebaseapp.com',
  projectId: 'smart-study-assistant-5c45b',
  storageBucket: 'smart-study-assistant-5c45b.firebasestorage.app',
  messagingSenderId: '513688854478',
  appId: '1:513688854478:web:e8f83b33074707d831559f',
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

export const auth = getAuth(app);