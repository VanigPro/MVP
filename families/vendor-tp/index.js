'use strict';

require('dotenv').config({ silent: true });

const { TransactionProcessor } = require('sawtooth-sdk/processor');
const { vendorRecordHandler } = require('./handler');
const { VALIDATOR_URL } = require('./../../config');

// Initialize Transaction Processor
console.info('VALIDATOR_URL:', VALIDATOR_URL);
const tp = new TransactionProcessor(VALIDATOR_URL);
tp.addHandler(new vendorRecordHandler());
tp.start();
