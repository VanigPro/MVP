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
const listedItemsAddr = '02';
const cartItemsAddr = '03';
const listedItemsMfgAddr = '04';
const MfgAddr = '05';
const SKUAddr = '06';
const tabAddressGenerate = {
  customerUser: (PREFIX, userpubkey) => {
    return PREFIX + customerUserAddr + getAddress(userpubkey, 62);
  },
  vendorUser: (PREFIX, userpubkey) => {
    return PREFIX + vendorUserAddr + getAddress(userpubkey, 62);
  },

  listedItems: (PREFIX, userpubkey, sku) => {
    return (
      PREFIX +
      listedItemsAddr +
      getAddress(userpubkey, 30) +
      (sku ? getAddress(sku, 32) : '')
    );
  },
  cartItems: (PREFIX, userpubkey, sku) => {
    return (
      PREFIX +
      cartItemsAddr +
      getAddress(userpubkey, 30) +
      (sku ? getAddress(sku, 32) : '')
    );
  },
  listedItemsMfg: (PREFIX, Manufacturer, sku) => {
    //3. Need API to retrieve list of all product's for a specific manu. by manufacturer ID(just the SKUs not the whole info)
    return (
      PREFIX +
      listedItemsMfgAddr +
      getAddress(Manufacturer, 32) +
      (sku ? getAddress(sku, 30) : '')
    );
  },
  Mfg: (PREFIX, Manufacturer) => {
    //2. Need API retrieve to list of manufacturers name and ID
    return (
      PREFIX + MfgAddr + (Manufacturer ? getAddress(Manufacturer, 62) : '')
    );
  },
  SKU: (PREFIX, SKU) => {
    //4. Need API to retrieve full product info -all the fields for specific SKU
    return PREFIX + SKUAddr + getAddress(SKU, 62);
  }
};
module.exports = {
  getAddress,
  tabAddressGenerate
};
