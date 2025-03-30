'use client';
import "../app/globals.css"
import "../styles/style.css"
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserContext from '../utils/userContext';
import Image from 'next/image';
import Link from 'next/link';
import Study from '../public/images/group-study.jpg';

const Login = () => {
  const setLoggedInUser = useContext(UserContext);
  const [user, setUser] = useState({ 
    email: '',
    password: '',
  });

  const router = useRouter();

  const onchangeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const loginHandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login', user, { withCredentials: true });
      setLoggedInUser(true);
      console.log(res.data);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-screen">
      
    </div>
  );
};

export default Login;
