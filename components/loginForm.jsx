'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';


export default function LoginForm() {
  const router = useRouter();
//   const setLoggedInUser = user;

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const onchangeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const loginHandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:8000/api/login',
        user,
        { withCredentials: true }
      );
      setLoggedInUser(true);
      console.log('Login Success:', res.data);
      router.push('/dash');
    } catch (err) {
      console.error('Login Failed:', err.response?.data || err.message);
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
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150"
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
