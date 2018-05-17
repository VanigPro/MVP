'use strict';

const $ = require('jquery');
const mnid = require('mnid');
const { initSteps } = require('./step');
const { getTokenHistory } = require('./state');
const { addLoader, removeLoader } = require('./components');
const { alertBox } = require('./confirm-dialog');

var tokenInstance,
  paymentInstance,
  accounts,
  isUport = false,
  totalPaymentBalance = 0,
  totalTokenBalance = 0,
  totalApprovalBalanceLeft = 0,
  amountToPay = 0;

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function getUrlParam(parameter, defaultvalue) {
  var urlparameter = defaultvalue;
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = getUrlVars()[parameter];
  }
  return urlparameter;
}

const pocfun = async uport => {
  amountToPay = getUrlParam('amount', '1');
  var tempStr = 'Pay ' + amountToPay + ' Vanig tokens to purchase items.';
  $('.payTokenString').text(tempStr);

  tempStr = 'Pay ' + amountToPay + ' Vanig tokens';
  $('.payTokenBtnString').text(tempStr);

  console.log(amountToPay);
  let Web3 = require('web3');
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    console.log('Using web3 detected from external source like Metamask');
    window.web3 = new Web3(web3.currentProvider);
    accounts = await window.web3.eth.getAccounts();
  } else {
    isUport = true;
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    console.log('No web3? You should consider trying MetaMask!');
    const uportData = JSON.parse(sessionStorage.getItem('credentials'));
    if (uportData.address) {
      const mniddecode = mnid.decode(uportData.address);
      window.web3 = uport.getWeb3();

      accounts = [];
      accounts[0] = mniddecode.address;
    } else {
      return false;
    }
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  //load contracts abi and get an instance of each
  const contract = require('truffle-contract');
  var TokenArtifact, PaymentArtifact;
  TokenArtifact = require('./../../EthereumVanigTokenContract/build/contracts/PoCToken.json');
  PaymentArtifact = require('./../../EthereumVanigTokenContract/build/contracts/Payment.json');

  let Token = contract(TokenArtifact);
  Token.setProvider(window.web3.currentProvider);
  let Payment = contract(PaymentArtifact);
  Payment.setProvider(window.web3.currentProvider);

  tokenInstance = await Token.deployed();
  paymentInstance = await Payment.deployed();

  return accounts;
};

const getApprovalBalance = async () => {
  let balance = await tokenInstance.allowance(
    accounts[0],
    paymentInstance.address
  );
  $('.approve-balance-left').text(balance);
  totalApprovalBalanceLeft = parseInt(balance);
};

const updateTotalPaymentDone = balance => {
  $('.total-amsys-payment').text(balance);
};

const updateTotalTokenBalance = async () => {
  let balance = await tokenInstance.balanceOf.call(accounts[0], {
    from: accounts[0]
  });
  $('.balance-amount').text(balance);
  totalTokenBalance = parseInt(balance);
};

const initContractMethod = async (callback, watchCallback, userCreatedTime) => {
  await getApprovalBalance();
  await updateTotalTokenBalance(); //get user balance

  let stepNumber = 1;
  if (isUport) {
    stepNumber = 0;
  } else if (totalTokenBalance > 0) {
    if (totalApprovalBalanceLeft > 0) {
      stepNumber = 3;
    } else {
      stepNumber = 2;
    }
  }
  initSteps(stepNumber); // initialize jquery steps plugin for 4 step process

  var isPaymentDone = false;
  const paymentEvent = await paymentInstance.LogPayment(
    { sender: accounts[0] },
    { fromBlock: 0, toBlock: 'latest' }
  );

  const latestBlock = await web3.eth.getBlockNumber();
  var paymentBlockArr = [];
  paymentEvent.watch(async (error, logs) => {
    if (error) {
      console.error(error);
    } else {
      const currentBlockNumber = logs['blockNumber'];
      var transactionBlock = await web3.eth.getBlock(currentBlockNumber);
      if (transactionBlock && transactionBlock['timestamp']) {
        var time = parseInt(transactionBlock['timestamp']) * 1000;
        var diffTime = time - userCreatedTime;
        if (diffTime > 0) {
          if (paymentBlockArr.indexOf(currentBlockNumber) === -1) {
            paymentBlockArr.push(currentBlockNumber);
            totalPaymentBalance += parseInt(logs['args']['amount']);
            updateTotalPaymentDone(totalPaymentBalance);
            if (isPaymentDone || currentBlockNumber >= latestBlock) {
              watchCallback(totalPaymentBalance);
              updateTotalTokenBalance();
              getApprovalBalance();
            }
          }
        }
      }
    }
  });

  var pocStepDiv = $('#poc-steps-container');

  $('.more-token').click(async () => {
    addLoader(pocStepDiv, 'Please wait your token request is in process');
    await tokenInstance
      .getTokens({ from: accounts[0] })
      .then(
        function(success) {
          updateTotalTokenBalance();
          removeLoader(pocStepDiv);
        },
        function(fail) {
          removeLoader(pocStepDiv);
        }
      )
      .catch(console.error);
  });

  $('.allow-payment').click(async () => {
    addLoader(pocStepDiv, 'Please wait your approval request is in process');
    await tokenInstance
      .approve(paymentInstance.address, 1000, {
        from: accounts[0]
      })
      .then(
        function(success) {
          getApprovalBalance();
          removeLoader(pocStepDiv);
        },
        function(fail) {
          removeLoader(pocStepDiv);
        }
      )
      .catch(console.error);
  });

  $('.make-payment').click(async () => {
    if (totalTokenBalance > 0) {
      addLoader(pocStepDiv, 'Please wait your payment request is in process');
      await paymentInstance
        .pay(amountToPay, { from: accounts[0] })
        .then(
          function(success) {
            alertBox(' Order has been placed successfully.');
            isPaymentDone = true;
            updateTotalTokenBalance();
            getApprovalBalance();
            if (isUport) {
              callback();
            }
            removeLoader(pocStepDiv);
          },
          function(fail) {
            alertBox('Payment failed. Please do the process again.');
            removeLoader(pocStepDiv);
          }
        )
        .catch(console.error);
    } else {
      alertBox(
        'You must request and approve additional VANIG tokens before proceeding'
      );
    }
  });
};

const getPaymentCountFromEthereum = async (userCreatedTime, callback) => {
  var paymetnDetailJson = {};
  paymetnDetailJson.tokenAddress = tokenInstance.address;
  paymetnDetailJson.receiverAddress = '0x1';
  paymetnDetailJson.payeesAddress = accounts[0];
  paymetnDetailJson.network = 'rinkeby';

  getTokenHistory(paymetnDetailJson, true, function(result, time) {
    var count = 0;
    $.each(result, function(key, val) {
      var time = parseInt(val['timeStamp']) * 1000;
      var diffTime = time - userCreatedTime;
      if (diffTime > 0) {
        var amountValue = parseInt(val['data']);
        count += amountValue;
      }
    });
    updateTotalPaymentDone(count);
    callback(count, accounts[0], time);
  });
};

module.exports = {
  pocfun,
  initContractMethod,
  getPaymentCountFromEthereum
};
