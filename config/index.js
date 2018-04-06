'use strict';

/* server config urls */
const VALIDATOR_URL = process.env.VALIDATOR_URL || 'tcp://192.168.99.100:4004';

/* client config urls */
const API_URL = process.env.API_URL || 'http://192.168.99.100:8008';
const WEBSOCKET_URL =
  process.env.WEBSOCKET_URL || 'ws://192.168.99.100:8008/subscriptions';

/* per day token charge */
const ONE_ITEM_TOKEN_CHARGE = process.env.ONE_ITEM_TOKEN_CHARGE || 100;

/* This is used for API call on Ethereum network. */
const ETHEREUM_API_KEY = process.env.ETHEREUM_API_KEY || 'YRZIYVV8F4CKV92EPMJQZA4NPUGQUFIYZ7';

const FAMILY_VENDOR = process.env.FAMILY || 'Vanig-Vendor';
const FAMILY_CUSTOMER = process.env.FAMILY_CUSTOMER || 'Vanig-Customer';
const VERSION = '1.0';

const CUSTOMER_PORTAL_URL = 'http://localhost:3000';
const VENDOR_PORTAL_URL = 'http://localhost:3100';

/* ECIES encryption enable or disable */
const IS_ENCRYPTION_ENABLED = false;

module.exports = {
  WEBSOCKET_URL,
  API_URL,
  ONE_ITEM_TOKEN_CHARGE,
  VALIDATOR_URL,
  VERSION,
  ETHEREUM_API_KEY,
  CUSTOMER_PORTAL_URL,
  VENDOR_PORTAL_URL,
  IS_ENCRYPTION_ENABLED,
  FAMILY_VENDOR,
  FAMILY_CUSTOMER
};
