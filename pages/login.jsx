'use client';

import '../app/globals.css';
import '../styles/style.css';
import React from 'react';
import LoginForm from '../components/loginForm'; // Make sure case matches file system

export default function Login() {
  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/group-study.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-8 max-w-md w-full">
        <LoginForm />
      </div>
    </div>
  );
}
