import '@testing-library/jest-dom';

// ------------------------------------------------------------------
// Polyfill TextEncoder / TextDecoder for MongoDB driver in Node < 17
// ------------------------------------------------------------------
const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
