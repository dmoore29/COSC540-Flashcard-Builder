import React from 'react'
import "../app/globals.css"
import Sidebar from '../components/sidebar'
import Profnav from '@/components/profnav'

const Dash = () => {
  return (
    <div className='bg-gray-600 min-h-screen'>
      <Profnav />
      <Sidebar />
        
    </div>
  )
}

export default Dash
