'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';


export default function regForm() {
  const router = useRouter();
//   const setLoggedInUser = user;

  const [user, setUser] = useState({
    fName: '',
    lName: '',
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
        
      );
      setLoggedInUser(true);
      console.log('Register Success:', res.data);
      router.push('/dashboard');
    } catch (err) {
      console.error('Register Failed:', err.response?.data || err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-1/2">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Register</h2>
        <form className="flex flex-col" onSubmit={loginHandleSubmit}>
        <input
            type="fName"
            name="fName"
            placeholder="First Name"
            value={user.fName}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
          />
          <input
            type="lName"
            name="lName"
            placeholder="Last Name"
            value={user.lName}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
          />
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
            Register
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
