import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';
import { setCookie, destroyCookie } from 'nookies';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload;
}

export function setAuthCookie(res, token) {
  setCookie({ res }, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  destroyCookie({ res }, 'token', { path: '/' });
}
