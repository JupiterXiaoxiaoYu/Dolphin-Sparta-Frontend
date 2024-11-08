export function randomBytes(size: number): Uint8Array {
  const array = new Uint8Array(size);
  if (typeof window !== 'undefined') {
    // Browser environment
    window.crypto.getRandomValues(array);
  } else {
    // Node.js environment
    const crypto = require('crypto');
    const randomBytesBuffer = crypto.randomBytes(size);
    array.set(new Uint8Array(randomBytesBuffer.buffer));
  }
  return array;
}

export default {
  randomBytes
}; 