const crypto = require('node:crypto');
const fs = require('fs');
const path = require('path');
const jsonwebtoken = require('jsonwebtoken');

const pathToKey = path.join(__dirname, '..', '/keys/id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

function generatePassword(receivedPassword) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(receivedPassword, salt, 10000, 64, 'sha512').toString('hex');

  return { salt, hash };
}

function checkPassword(receivedPassword, receivedHash, receivedSalt) {
  // console.log("checkPassword > receivedPassword: ", receivedPassword)
  // console.log("checkPassword > receivedHash: ", receivedHash)
  // console.log("checkPassword > receivedSalt: ", receivedSalt)
  const generatedHash = crypto.pbkdf2Sync(receivedPassword, receivedSalt, 10000, 64, 'sha512').toString('hex');
  return receivedHash === generatedHash;
}

function issueJWT(user) {
  const { email } = user;
  // console.log("user:", user)
  const payload = {
    sub: email,
    iat: Math.floor(Date.now() / 1000)
  };
  const expiresIn = '1d';

  const signedJwtToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: "Bearer " + signedJwtToken,
    expiresIn
  }
}

module.exports = { generatePassword, checkPassword, issueJWT };