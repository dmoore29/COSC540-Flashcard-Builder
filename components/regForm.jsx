'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterForm() {
  const router = useRouter();

  const [user, setUser] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onchangeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const registerHandleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      alert("Passwords don't match.");
      return;
    }

    try {
      const res = await axios.post('/api/auth/register', user);
      console.log('Register Success:', res.data);
      router.push('/dash');
    } catch (err) {
      console.error('Register Failed:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-1/2">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Register</h2>
        <form className="flex flex-col" onSubmit={registerHandleSubmit}>
          <input
            type="text"
            name="fName"
            placeholder="First Name"
            value={user.fName}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4"
          />
          <input
            type="text"
            name="lName"
            placeholder="Last Name"
            value={user.lName}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4"
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={user.confirmPassword}
            onChange={onchangeHandler}
            className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4"
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
