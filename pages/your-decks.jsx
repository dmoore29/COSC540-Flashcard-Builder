import React from 'react';
import "../app/globals.css";
import Sidebar from '../components/sidebar';
import Profnav from '@/components/profnav';
import YourDecks from '@/components/YourDecks';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default function YourDecksPage({ user }) {
  console.log('YourDecksPage - User data:', user); 
  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
      <YourDecks user={user} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const cookies = parse(context.req.headers.cookie || '');
  const token = cookies.token;

  console.log('Token from cookies:', token); 

  if (!token) {
    console.log('No token found, redirecting to login');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const user = await verifyToken(token);
    console.log('Verified user:', user); 
    return {
      props: {
        user: {
          email: user.email,
          id: user.id
        }
      },
    };
  } catch (err) {
    console.error('Token verification failed:', err);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
} 