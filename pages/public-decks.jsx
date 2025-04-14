import React from 'react';
import "../app/globals.css";
import Sidebar from '../components/sidebar';
import Profnav from '@/components/profnav';
import PublicDeckGallery from '@/components/PublicDeckGallery';

export default function PublicDecks() {
  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
      <PublicDeckGallery />
    </div>
  );
} 