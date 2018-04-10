'use strict';

const { createHash } = require('crypto');

const secp256k1 = require('./../server/node_modules/secp256k1');
const _decodeBuffer = (buffer, format) => {
  if (buffer instanceof Buffer) return buffer;
  return Buffer.from(buffer, format);
};
const decodeHex = hex => _decodeBuffer(hex, 'hex');

const getAddressForKey = (key, length = 64) => {
  return createHash('sha512')
    .update(key)
    .digest()
    .slice(0, length);
};

/**
 * Generates a random 256-bit private key.
 *
 * @return {string} 256-bit private key represented as a 64-char hex string.
 */
const makePrivateKey = password => {
  let privateKey;

  do
    privateKey = getAddressForKey(password, 32); // Gennerate 32 bit sha512 password
  while (!secp256k1.privateKeyVerify(privateKey));

  return privateKey.toString('hex');
};
/**
 * Returns the safe to share public key for a 256-bit private key.
 *
 * @param {string|Buffer} privateKey - 256-bit private key encoded as either
 *      a hex string or raw binary Buffer.
 *
 * @return {string} Public key represented as a hex string.
 */
const getPublicKey = privateKey => {
  const privateBuffer = decodeHex(privateKey);

  const publicKey = secp256k1.publicKeyCreate(privateBuffer);
  return publicKey.toString('hex');
};

// Create new key-pair
const makeKeyPair = (publicKey, name, avatar) => {
  const privateKey = makePrivateKey(publicKey);

  let imageUrl = '';
  if (avatar && avatar.uri) {
    imageUrl = avatar.uri;
  }
  return {
    public: getPublicKey(privateKey),
    private: privateKey,
    name,
    imageUrl
  };
};

module.exports = {
  makeKeyPair,
  getPublicKey,
  decodeHex
};
