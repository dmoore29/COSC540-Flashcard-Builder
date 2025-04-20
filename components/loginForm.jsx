'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginForm() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const onchangeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const loginHandleSubmit = async (e) => {
    e.preventDefault();

    //Basic Validation
    if (!user.email) {
      alert('Email is required');
      return;
    }
    if (!user.password) {
      alert('Password is required');
      return;
    }

    try {
      const res = await axios.post('/api/auth/login', user, {
        withCredentials: true, // include cookie in browser
      });

      console.log('Login Success:', res.data);
      router.push('/dash'); // or whatever your protected route is
    } catch (err) {
      console.error('Login Failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-1/2">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Login</h2>
        <form className="flex flex-col" onSubmit={loginHandleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={user.email}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4"
          >
            Login
          </button>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
