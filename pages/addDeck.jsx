import React from 'react';
import "../app/globals.css";
import Sidebar from '../components/sidebar';
import Profnav from '@/components/profnav';
import AddDeckForm from '@/components/AddDeckForm';


const AddCard = ({ user }) => {
  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
      <AddDeckForm user={user} />
    </div>
  );
};



export default AddCard;