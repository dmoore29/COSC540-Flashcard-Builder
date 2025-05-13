import { SignJWT, jwtVerify } from 'jose';
import { setCookie, destroyCookie } from 'nookies';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken(user) {
  // Ensure user._id is a string
  const userId = user._id?.toString();
  if (!userId) {
    throw new Error('Invalid user ID for token generation');
  }

  const token = await new SignJWT({ id: userId, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(SECRET);
  return token;
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  // Ensure the ID is a string in the payload
  if (payload.id) {
    payload.id = payload.id.toString();
  }
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
