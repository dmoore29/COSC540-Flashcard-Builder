'use client'

import "../app/globals.css"
import { useState } from 'react'
import { BiSolidAddToQueue, BiSolidCabinet } from "react-icons/bi";
import { RiCompassDiscoverLine } from "react-icons/ri";
import { MdSettingsApplications } from "react-icons/md";

export default function Sidebar() {
  const [nav, setNav] = useState(false)
  const handleClick = () => setNav(!nav)

  return (
    <div className='fixed w-full h-[80px] flex justify-between items-center px-4 bg-transparent text-gray-300 z-50'>
      

      {/* Sidebar links */}
      <div className='hidden lg:flex fixed flex-col top-[35%] left-0'>
        <ul>
          <li className='w-[160px] h-[60px] flex justify-between items-center ml-[-100px] hover:ml-[-10px] duration-300 bg-blue-600'>
            <a className='flex justify-between items-center w-full text-xl text-gray-950 ml-4' href="https://www.linkedin.com/in/jason-grammer-dev82/" target="_blank">Discover<RiCompassDiscoverLine size={30} className='mr-4' /></a>
          </li>
          <li className='w-[160px] h-[60px] flex justify-between items-center ml-[-100px] hover:ml-[-10px] duration-300 bg-fuchsia-400'>
            <a className='flex justify-between items-center w-full text-xl text-gray-950 ml-3.5' href="https://github.com/Brewerjg" target="_blank">New Deck<BiSolidAddToQueue size={30} className='mr-4' /></a>
          </li>
          <li className='w-[160px] h-[60px] flex justify-between items-center ml-[-100px] hover:ml-[-10px] duration-300 bg-green-300'>
            <a className='flex justify-between items-center w-full text-xl text-gray-950 ml-3.5' href="https://github.com/Brewerjg" target="_blank">My Topics<BiSolidCabinet size={30} className='mr-4' /></a>
          </li>
          <li className='w-[160px] h-[60px] flex justify-between items-center ml-[-100px] hover:ml-[-10px] duration-300 bg-slate-800'>
            <a className='flex justify-between items-end w-full text-xl text-gray-300 ml-4' href="https://github.com/Brewerjg" target="_blank">Settings<MdSettingsApplications size={30} className='mr-4' /></a>
          </li>
        </ul>
      </div>
    </div>
  )
}
