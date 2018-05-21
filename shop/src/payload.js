'use strict';

const $ = require('jquery');
const { wbGetValidMobileNumberIntInput } = require('./validation');

const { IS_ENCRYPTION_ENABLED } = require('./../../config');
const isHex = require('is-hex');

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const uniqueIDGenerate = len => {
  let timeStamp = new Date().getTime();
  let ts = timeStamp.toString();
  let parts = ts.split('').reverse();
  let id = '';

  for (var i = 0; i < len; ++i) {
    let index = getRandomInt(0, parts.length - 1);
    id += parts[index];
  }
  return id;
};

const payLoadDecrypt = (pubKey, privKey, payload, isMessage) => {
  let asset = payload;

  return JSON.parse(asset);
};

const payLoadEncrypt = (pubKey, privKey, payload, isMessage) => {
  payload = JSON.stringify(payload);
  return payload;
};

const getGenericPayLoadObj = (
  action,
  asset,
  singerPubKey,
  singerPriKey,
  isMessage,
  bothUserKeys,
  receiverPubKey
) => {
  receiverPubKey = receiverPubKey ? receiverPubKey : singerPubKey;
  return {
    action,
    asset: payLoadEncrypt(receiverPubKey, singerPriKey, asset, isMessage),
    owner: singerPubKey,
    isMessage,
    bothUserKeys,
    msgDecryptKey: singerPubKey
  };
};

const getPayLoadObj = (action, asset, app, isMessage, bothUserKeys, pubKey) => {
  pubKey = pubKey ? pubKey : app.user.public;
  return {
    action,
    asset: payLoadEncrypt(pubKey, app.user.private, asset, isMessage),
    owner: app.user.public,
    isMessage,
    bothUserKeys,
    msgDecryptKey: app.user.public
  };
};

const calculatePayLoad = {
  vendorUser: (isTest, app) => {
    let asset = { name: app.user.name, isTest };
    return getPayLoadObj('create', asset, app, 'vendorUser');
  },
  customerUser: (isTest, app) => {
    let asset = { name: app.user.name, isTest };
    return getPayLoadObj('create', asset, app, 'customerUser');
  },
  payment: (amount, senderAddr, app) => {
    let asset = {
      sender: senderAddr,
      amount: amount,
      receiver: '0x1'
    };
    return getPayLoadObj('create', asset, app, 'payment');
  },
  listedItems: (asset, app) => {
    return getPayLoadObj('create', asset, app, 'listedItems');
  },
  cartItems: (asset, app) => {
    return getPayLoadObj('create', asset, app, 'cartItems');
  }
};

module.exports = {
  calculatePayLoad,
  payLoadDecrypt,
  getGenericPayLoadObj
};
