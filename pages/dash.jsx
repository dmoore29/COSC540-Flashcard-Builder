import React, { useEffect, useState } from 'react'
import "../app/globals.css"
import Sidebar from '../components/sidebar'
import Profnav from '@/components/profnav'
import PublicDeckGallery from '@/components/PublicDeckGallery'
import YourDecks from '@/components/YourDecks'
import axios from 'axios'

const Dash = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
        console.log('User data fetched:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
      <YourDecks user={user} />
      <PublicDeckGallery />
    </div>
  )
}

export default Dash
