'use strict';

const $ = require('jquery');
const { alertBox } = require('./confirm-dialog');

const getValidatorState = (cb, userAddr, tabname) => {
  var reqData = { userAddr: userAddr };
  $.post('/get_validator_state', reqData, res => {
    if (res.error) {
      if (tabname === 'vendorUser') {
        console.error(
          'There is some issue in validator for getting poster',
          res.error
        );
      } else {
        console.error('There is some issue in validator for fetching tabs');
      }
    } else {
      const data = JSON.parse(res.body).data;
      cb(
        data.reduce(
          (processed, datum) => {
            if (datum.data !== '') {
              const parsed = JSON.parse(atob(datum.data));
              processed.tabData.push(parsed);
            }
            return processed;
          },
          { tabData: [] }
        )
      );
    }
  });
};

const getServerDate = callback => {
  $.getJSON('/server_time', function(data) {
    var serverDate = new Date(data);
    callback(serverDate.getTime());
  });
};

const getPortal = callback => {
  $.getJSON('/get_portal', function(result) {
    callback(result.body);
  });
};

// Submit signed Transaction to validator
const submitUpdate = (payloadArr, privateKey, cb) => {
  var reqData = {
    payloadArr: payloadArr,
    privateKey: privateKey
  };
  $.post('/validator_batch_submit', reqData, res => {
    if (res.error) {
      console.error(res);
      alertBox(
        'There is some issue in batch submit. Please try after sometime'
      );
      cb(null);
    } else {
      let body = JSON.parse(res.body);
      cb(body);
    }
  });
};

const getTokenHistory = (reqData, isPaymentLogs, callback) => {
  $.post('/token_history', reqData, function(data) {
    if (data.error) {
      if (isPaymentLogs) {
        alertBox(
          'There is some issue in Rinkey etherscan API. Please retry after some time'
        );
      } else {
        console.log('Please retry');
      }
    } else {
      const result = JSON.parse(data.body).result;
      callback(result, data.time);
    }
  });
};

module.exports = {
  submitUpdate,
  getValidatorState,
  getServerDate,
  getTokenHistory,
  getPortal
};
