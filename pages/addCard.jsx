import React from 'react';
import "../app/globals.css";
import Sidebar from '../components/sidebar';
import Profnav from '@/components/profnav';
import AddCardForm from '@/components/AddCardForm';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

const AddCard = ({ user }) => {
  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
      <AddCardForm user={user} />
    </div>
  );
};

export async function getServerSideProps(context) {
  const cookies = parse(context.req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const user = await verifyToken(token);
    return {
      props: {
        user: {
          email: user.email,
          id: user.id
        }
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

export default AddCard;
