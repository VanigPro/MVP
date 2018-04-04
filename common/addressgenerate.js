'use strict';

const { createHash } = require('crypto');

const getAddress = (key, length = 64) => {
  return createHash('sha512')
    .update(key)
    .digest('hex')
    .toLowerCase()
    .slice(0, length);
};

const { FAMILY_VENDOR, FAMILY_CUSTOMER } = require('../config');
const PREFIX_VENDOR = getAddress(FAMILY_VENDOR, 6);
const PREFIX_CUSTOMER = getAddress(FAMILY_CUSTOMER, 6);

const customerUserAddr = '00';
const vendorUserAddr = '01';

const tabAddressGenerate = {
  customerUser: (PREFIX, userpubkey) => {
    return PREFIX + customerUserAddr + getAddress(userpubkey, 62);
  },
  vendorUser: (PREFIX, userpubkey) => {
    return PREFIX + vendorUserAddr + getAddress(userpubkey, 62);
  }
};

module.exports = {
  getAddress,
  tabAddressGenerate
};
