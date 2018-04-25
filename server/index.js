'use strict';

require('dotenv').config({ silent: true });
const cors = require('cors');
const bodyParser = require('body-parser');
const { API_URL, ETHEREUM_API_KEY } = require('./../config');

const { getBatchBytes } = require('./transaction');
const { makeKeyPair } = require('./../common');

const {
  getAddress,
  tabAddressGenerate
} = require('./../common/addressgenerate');

const { FAMILY_VENDOR, VERSION } = require('./../config');
const PREFIX = getAddress(FAMILY_VENDOR, 6);

const express = require('express');
const path = require('path');
const atob = require('atob');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();
//const bodyParser = require('body-parser');
const request = require('request');

const toInternalError = err => {
  let message = err.message ? err.message : err;
  throw Error(message);
};

router.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '../vendorWeb')));
app.use('/customer', express.static(path.join(__dirname, '../clientWeb')));
app.use('/product', express.static(path.join(__dirname, '../product')));

router.get('/server_time', function(req, res) {
  const currentDate = new Date();
  res.status(200).send(currentDate);
});

console.log(process.env.FAMILY);
console.log(process.env.PORTAL_USED_AS);
console.log(process.env.PORT);

router.get('/get_portal', function(req, res) {
  let resObj = {
    error: null,
    body: { portal: process.env.PORTAL_USED_AS, family: process.env.FAMILY }
  };
  console.log(resObj);
  res.status(200).send(resObj);
});

//get list of items with owner
router.get('/get_item_list', function(req, res) {
  let userAddr = '';
  let tabname = 'listeditems';

  userAddr = '7d7f7702'; //tabAddressGenerate[tabname](PREFIX, app.user.public,'');
  //userAddr = tabAddressGenerate[tabname](PREFIX, app.user.public,'');

  let asset = {};
  let tmpObj = {};
  let items = [];
  let parsed = {};

  try {
    const url = API_URL + '/state?address=' + userAddr;
    request.get(url, function(error, response, body) {
      let resObj;
      if (error) {
        console.error(error);
        resObj = { error: error, body: null };
      } else {
        //check if json
        try {
          parsed = JSON.parse(body);
        } catch (error) {
          resObj = { error: error, body: null };
          res.status(200).send(resObj);
        }

        console.log(parsed.data.length);
        if (parsed.data.length) {
          parsed.data.forEach(payloadObj => {
            asset = JSON.parse(atob(payloadObj.data));
            tmpObj = JSON.parse(asset.asset);
            tmpObj['owner'] = asset.owner;
            items.push(tmpObj);
          });
        }
      }
      //console.log(resObj);
      res.status(200).send(items);
    });
  } catch (error) {
    resObj = { error: error, body: null };
    res.status(200).send(resObj);
  }
});

// Application Object
const appObj = {
  user: null,
  keys: [],
  state: 'normal' /*,
  currentTab: 'items-listed',
  vendorListItems: ''*/
};

//from vendorWeb/src/payload.js
const payLoadEncrypt = (pubKey, privKey, payload, isMessage) => {
  payload = JSON.stringify(payload);
  return payload;
};

//from vendorWeb/src/app.js
const getPayLoadObj = (
  action,
  asset,
  appObj,
  isMessage,
  bothUserKeys,
  pubKey
) => {
  pubKey = pubKey ? pubKey : appObj.user.public;
  return {
    action,
    asset: payLoadEncrypt(pubKey, appObj.user.private, asset, isMessage),
    owner: appObj.user.public,
    isMessage,
    bothUserKeys,
    msgDecryptKey: appObj.user.public
  };
};

//from vendorWeb/src/payload.js
const calculatePayLoad = {
  vendorUser: (isTest, appObj) => {
    let asset = { name: appObj.user.name, isTest };
    return getPayLoadObj('create', asset, appObj, 'vendorUser');
  }
  /*customerUser: (isTest, appObj) => {
    let asset = { name: appObj.user.name, isTest };
    return getPayLoadObj('create', asset, appObj, 'customerUser');
  },
  payment: (amount, senderAddr, appObj) => {
    let asset = {
      sender: senderAddr,
      amount: amount,
      receiver: '0x1'
    };
    return getPayLoadObj('create', asset, appObj, 'payment');
  },
  listedItems: (asset, appObj) => {
    return getPayLoadObj('create', asset, appObj, 'listedItems');
  }*/
};
//from vendorWeb/src/app.js
const userCreate = (isTest, cb) => {
  let isMessage = 'vendorUser';
  const payLoadObj = calculatePayLoad[isMessage](isTest, appObj);
  //app.update([payLoadObj], isMessage);
  //console.log(payLoadObj);
  let payLoadArr = [payLoadObj];

  let reqData = {
    payloadArr: payLoadArr,
    privateKey: appObj.user.private
  };

  const body = reqData;
  //payLoadArr.time = new Date().getTime();
  payLoadArr.forEach(payloadObj => {
    payloadObj.time = new Date().getTime();
    console.log(payloadObj);
  });

  const batchBytes = getBatchBytes(payLoadArr, body.privateKey);
  //console.log(batchBytes);

  request.post(
    {
      uri: `${API_URL}/batches?wait`,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: batchBytes
    },
    function(error, response, body) {
      let resObj;
      if (error) {
        console.error(error);
        resObj = { error: error, body: null };
        cb(resObj);
        return resObj;
        //res.status(200).send(resObj);
      } else {
        try {
          // Need try catch for url
          let url = JSON.parse(body).link;
          //console.log(url);
          // This is used for checking succesfully commited transaction in sawtooth
          request.get(url, { timeout: 30000 }, function(error, response, body) {
            if (error) {
              resObj = { error: error, body: null };
            } else {
              resObj = {
                error: false,
                body: body,
                time: new Date().getTime()
              };
            }
            cb(resObj);
            return resObj;
            //res.status(200).send(resObj);
          });
        } catch (error) {
          resObj = { error: error, body: null };
          cb(resObj);
          toInternalError(error);
        }
      }
    }
  );
};

router.post('/save_item', function(req, res) {
  try {
    console.log(req.body);
    //const body = req.body;

    //calculate payLoad
    let asset = req.body;

    let action = 'create';
    let isMessage = 'listedItems';

    let pubKey = req.body.OwnerID;
    let usrName = req.body.OwnerName;
    let usrAvatar = '';
    appObj.user = makeKeyPair(pubKey, usrName, usrAvatar);
    //console.log(appObj);

    let tmpObj = userCreate(false, resObj => {
      // user create return value if required.....

      //let pubKey = pubKey ? pubKey : appObj.user.public;
      let bothUserKeys = null;

      const payLoadObj = {
        action,
        asset: JSON.stringify(asset), //payLoadEncrypt(pubKey, appObj.user.private, asset, isMessage),
        owner: appObj.user.public,
        isMessage,
        bothUserKeys,
        msgDecryptKey: appObj.user.public
      };

      let reqData = {
        payloadArr: payLoadObj,
        privateKey: appObj.user.private
      };

      const body = reqData;
      const payLoadArr = new Array(reqData.payloadArr);
      //payLoadArr.time = new Date().getTime();
      payLoadArr.forEach(payloadObj => {
        payloadObj.time = new Date().getTime();
        console.log(payloadObj);
      });

      const batchBytes = getBatchBytes(payLoadArr, body.privateKey);
      //console.log(`${API_URL}/batches?wait`);

      request.post(
        {
          uri: `${API_URL}/batches?wait`,
          headers: { 'Content-Type': 'application/octet-stream' },
          body: batchBytes
        },
        function(error, response, body) {
          let resObj;
          if (error) {
            console.error(error);
            resObj = { error: error, body: null };
            res.status(200).send(resObj);
          } else {
            try {
              // Need try catch for url
              let url = JSON.parse(body).link;
              //console.log(url);
              // This is used for checking succesfully commited transaction in sawtooth
              request.get(url, { timeout: 30000 }, function(
                error,
                response,
                body
              ) {
                if (error) {
                  resObj = { error: error, body: null };
                } else {
                  resObj = {
                    error: false,
                    body: body,
                    time: new Date().getTime()
                  };
                }
                res.status(200).send(resObj);
              });
            } catch (error) {
              toInternalError(error);
            }
          }
        }
      );
    });

    //res.status(200).send(req.body);
  } catch (error) {
    toInternalError(error);
  }
});

router.post('/get_validator_state', function(req, res) {
  try {
    const url = API_URL + '/state?address=' + req.body.userAddr;
    request.get(url, function(error, response, body) {
      let resObj;
      if (error) {
        console.error(error);
        resObj = { error: error, body: null };
      } else {
        resObj = {
          error: false,
          body: body,
          time: new Date().getTime()
        };
      }
      res.status(200).send(resObj);
    });
  } catch (error) {
    toInternalError(error);
  }
});

router.post('/validator_batch_submit', function(req, res) {
  try {
    console.log(req.body);
    const body = req.body;
    const payLoadArr = body.payloadArr;
    payLoadArr.forEach(payloadObj => {
      payloadObj.time = new Date().getTime();
    });
    const batchBytes = getBatchBytes(payLoadArr, body.privateKey);
    console.log('submit batch bytes...');
    request.post(
      {
        uri: `${API_URL}/batches?wait`,
        headers: { 'Content-Type': 'application/octet-stream' },
        body: batchBytes
      },
      function(error, response, body) {
        let resObj;
        if (error) {
          console.error(error);
          resObj = { error: error, body: null };
          res.status(200).send(resObj);
        } else {
          try {
            // Need try catch for url
            let url = JSON.parse(body).link;
            console.log(url);
            // This is used for checking succesfully commited transaction in sawtooth
            request.get(url, { timeout: 30000 }, function(
              error,
              response,
              body
            ) {
              if (error) {
                resObj = { error: error, body: null };
              } else {
                resObj = {
                  error: false,
                  body: body,
                  time: new Date().getTime()
                };
              }
              res.status(200).send(resObj);
            });
          } catch (error) {
            toInternalError(error);
          }
        }
      }
    );
  } catch (error) {
    toInternalError(error);
  }
});

const TOPIC_SIZE = 64;
/* Get ethereum payment and token transfer logs */
router.post('/token_history', function(req, res) {
  try {
    const tokenTransactionQuery = req.body;
    var tokenAddress = tokenTransactionQuery['tokenAddress'];
    var receiverAddress = tokenTransactionQuery['receiverAddress'];
    var payeeAddress = tokenTransactionQuery['payeesAddress'];
    var blockStart = '0x0';
    var blockEnd = 'latest';
    var network = tokenTransactionQuery['network'];
    var ethereum_api_url =
      'https://rinkeby.etherscan.io/api?module=logs&action=getLogs';
    if (network === 'ropsten') {
      ethereum_api_url =
        'https://ropsten.etherscan.io/api?module=logs&action=getLogs';
    }

    //	receiverAddress = parseInt(receiverAddress);
    //	var topicTemp = receiverAddress.toString(16);
    var topicTemp = receiverAddress.slice(2);
    while (topicTemp.length < TOPIC_SIZE) topicTemp = '0' + topicTemp;
    receiverAddress = '0x' + topicTemp;

    //payeeAddress = parseInt(payeeAddress);
    //	var addressTemp = payeeAddress.toString(16);
    var addressTemp = payeeAddress.slice(2);
    while (addressTemp.length < TOPIC_SIZE) addressTemp = '0' + addressTemp;
    payeeAddress = '0x' + addressTemp;

    var url =
      ethereum_api_url +
      '&fromBlock=' +
      blockStart +
      '&toBlock=' +
      blockEnd +
      '&address=' +
      tokenAddress +
      '&topic2=' +
      receiverAddress +
      '&topic1=' +
      payeeAddress +
      '&apikey=' +
      ETHEREUM_API_KEY;

    request.get(url, function(error, response, body) {
      let resObj;
      if (error) {
        console.error(error);
        resObj = { error: error, body: null };
      } else {
        resObj = { error: false, body: body, time: new Date().getTime() };
      }
      res.status(200).send(resObj);
    });
  } catch (error) {
    toInternalError(error);
  }
});

app.use(router);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.info('Vanig server listening on port', port);
  console.info('API_URL:', process.env.API_URL);
  console.info('WEBSOCKET_URL:', process.env.WEBSOCKET_URL);
});
