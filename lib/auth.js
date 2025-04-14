import { SignJWT, jwtVerify } from 'jose';
import { setCookie, destroyCookie } from 'nookies';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken(user) {
  const token = await new SignJWT({ id: user._id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(SECRET);
  return token;
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
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
