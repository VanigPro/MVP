'use strict';

import { Connect, QRUtil, SimpleSigner, Credentials } from 'uport-connect';

const $ = require('jquery');

const intltelinput = require('intl-tel-input');
const intlTelInputUtils = require('./utils');

const { calculatePayLoad, payLoadDecrypt } = require('./payload');
const {
  submitUpdate,
  ws,
  getValidatorState,
  getServerDate,
  getPortal
} = require('./state');

const {
  addLoader,
  removeLoader,
  getHeaderHtml,
  getMainTabsHtml,
  addUserHeaderDiv,
  addEditIconForMobile,
  getListedItemsHtml,
  addNewItemDiv
} = require('./components');

const { wbInitMobileintlTelInput } = require('./validation');
const { alertBox, initConfirmBox } = require('./confirm-dialog');
const {
  FAMILY_VENDOR,
  FAMILY_CUSTOMER,
  ONE_ITEM_TOKEN_CHARGE
} = require('./../../config');
const { makeKeyPair } = require('./../../common');
const {
  getAddress,
  tabAddressGenerate
} = require('./../../common/addressgenerate');
const { initWebSocket } = require('./websocket');

const pagename = $(document.body).data('page');

let PORTAL_USED_AS = '';
let FAMILY = '';
let PREFIX = '';

// Application Object
const app = {
  user: null,
  keys: [],
  state: 'normal',
  currentTab: 'items-listed',
  vendorListItems: ''
};

$(document).on('click', '#frmSubmit', function() {
  var formData = {};
		$.each($("#frmadditem").serializeArray(), function(i, pair){
			var cObj = formData, pObj, cpName;
			$.each(pair.name.split("."), function(i, pName){
				pObj = cObj;
				cpName = pName;
				cObj = cObj[pName] ? cObj[pName] : (cObj[pName] = {});
			});
			pObj[cpName] = pair.value;
		});
		formData = JSON.stringify(formData);
    //alert(formData);

    //app.update($("#frmadditem").serializeArray(), '');
    app.update(formData, 'tabs');

    //const payLoadObj = calculatePayLoad('payment')(formData);
    //app.update([payLoadObj], 'payment');

    /*$.ajax({
			url: 'test_post.php', // url where to submit the request
			type : "POST",
			dataType : 'json',
			contentType : "application/json",
			data : formData,
			success : function(result) {
				$("#frmMsg").html("Data has been saved successfully.");
				$( "#frmMsg").removeClass( "error").addClass("success");
				//console.log(result);
			},
			error: function(xhr, resp, text) {
				$("#frmMsg").html("There is some error while procesing your request.");
				$( "#frmMsg" ).removeClass( "success").addClass("error");
				//console.log(xhr, resp, text);
			}
		})*/
});

$(document).on('click', '#next', function() {
  var newTab = $('#' + app.currentTab).next('.tab-div');
  app.currentTab = $(newTab).attr('id');
  $('#home-tabs')
    .find("[data-toggle='" + app.currentTab + "']")
    .trigger('click');
  if (app.currentTab === 'contact') {
    $('#next').addClass('hide');
    $('#edit-done').removeClass('hide');
  } else {
    $('#next').removeClass('hide');
    $('#edit-done').addClass('hide');
  }
});

$(document).on('click', '#addPhoneNumber', function() {
  $('.phone-edit').append(getPhoneHtml());
  wbInitMobileintlTelInput($('.phone-edit').find('.mobile-phone'));
});

$(document).on('click', '#home-tabs a', function() {
  var id = $(this).data('toggle');
  app.currentTab = id;
  console.log(id);
  $('.nav-li').removeClass('active');
  $('#home-tabs')
    .find("[data-toggle='" + id + "']")
    .addClass('active');

  $('.tab-div').addClass('hide');
  $('#' + id).removeClass('hide');

  if (app.state === 'edit') {
    $('#' + id + '-final').addClass('hide');
    $('#' + id + '-edit').removeClass('hide');

    if (app.singlePageSave) {
      $('#edit-done').removeClass('hide');
    } else {
      if (app.currentTab === 'contact') {
        $('#next').addClass('hide');
        $('#edit-done').removeClass('hide');
      } else {
        $('#next').removeClass('hide');
        $('#edit-done').addClass('hide');
      }
    }
    $('#cancel-task').removeClass('hide');
  } else {
    $('.next-btn').addClass('hide');
    $('.add-new-item').removeClass('hide');

    $('#' + id + '-edit').addClass('hide');
    $('#' + id + '-final').removeClass('hide');
  }
});

$(document).on('click', '#cancel-task', function() {
  app.state = 'normal';
  $('#home-tabs')
    .find("[data-toggle='" + app.currentTab + "']")
    .trigger('click');
});

$(document).on('click', '.appointment-handle', function() {
  let $this = $(this);
  let requestFor = $this.data('appointment');
  addLoader($this);
  let uniqueid = $this.closest('div.card').data('uniqueid');
  let asset = app.appointments[uniqueid];
  if (calculatePayLoad[requestFor]) {
    const payLoadObj = calculatePayLoad[requestFor](asset, app);

    app.update([payLoadObj], 'tabs', $this);
  }
});

$(document).on('click', '.lab-file-delete', function() {
  let $this = $(this);
  addLoader($this);
  let filehash = $this.closest('div').data('filehash');
  let asset = app.lab[filehash];
  const payLoadObj = calculatePayLoad['lab-delete'](asset, app);
  app.update([payLoadObj], 'tabs', $this);
});

$(document).on('click', '.lab-file-view', function() {
  let $this = $(this);
  let fileDiv = $this.closest('div').find('.lab-img');
  fileDiv.toggleClass('hide');
  if (fileDiv.hasClass('hide')) {
    $this.html('View');
  } else {
    $this.html('Close');
  }
});

const addUserNameAndImage = () => {
  $('#user-full-name').html(app.user.name);
  if (app.user.imageUrl) {
    $('.user-photo').attr('src', app.user.imageUrl);
  }
};

$(document).on('click', '.add-new-item', function() {
  let $this = $(this);
  let requestFor = $this.data('appointment');
  addLoader($this);
  let uniqueid = $this.closest('div.card').data('uniqueid');
  let asset = app.appointments[uniqueid];
  if (calculatePayLoad[requestFor]) {
    const payLoadObj = calculatePayLoad[requestFor](asset, app);

    app.update([payLoadObj], 'tabs', $this);
  }
});

const changeLoginStatus = isLoggedIn => {
  if (isLoggedIn) {
    initWebSocket(PREFIX, handleWebsocketResponse);
    $('#user-login-div').remove();
    $(document.body).append(getHeaderHtml() + getMainTabsHtml());
    addUserHeaderDiv(app.user.imageUrl, app.user.name);
    addUserNameAndImage();
    addEditIconForMobile();

    var items = [
      {
        SKU: 'SKMWDF123',
        ItemNo: 'ITM001',
        Description: 'Vanig Logo Printed T-Shirt',
        Color: 'White',
        Size: 'Large',
        Price: '40',
        Manufacturer: 'Niky',
        MfgDate: '02/28/2018',
        MfgLocation: 'USA',
        ExpiryDate: 'NA',
        CurrentLocation: 'Columbus, USA',
        MadeOf: '100% Cotton'
      },
      {
        SKU: 'SKGWDF456',
        ItemNo: 'ITM002',
        Description: 'Vanig Logo Jeanes',
        Color: 'Blue',
        Size: 'Medium',
        Price: '50',
        Manufacturer: 'Denim',
        MfgDate: '03/02/2018',
        MfgLocation: 'Canada',
        ExpiryDate: 'NA',
        CurrentLocation: 'PA, USA',
        MadeOf: '100% Cotton'
      }
    ];

    app.Items = items;

    getListedItemsHtml('#items-listed', app.Items);

    addNewItemDiv('#add-new-item', app.newItemm);

    //  addNewItemDiv('#add-new-item', app.newItemm);
  }
};

const constructTabhtml = (parsed, fromStart) => {
  console.log(parsed);
  var asset;
  let msgDecryptKey = parsed.msgDecryptKey || app.user.public;
  switch (parsed.isMessage) {
    case 'test':
      asset = payLoadDecrypt(msgDecryptKey, app.user.private, parsed.asset);
      if (asset) {
        getTestHtml('#test-final', asset);
        app.test = asset;
      }
      break;
    default:
      break;
  }
};

var isStart = true;
const doSinglePageSaveHandling = isDataAvailable => {
  if (isDataAvailable) {
    if (!app.singlePageSave) {
      $('#next').remove();
    }
    app.singlePageSave = true;
  } else if (isStart) {
    app.singlePageSave = false;
    $('.add-new-item').trigger('click');
    $('#cancel-task').addClass('hide');
    isStart = false;
  }
};

const getIndividualTabsData = tabname => {
  let userAddr = '';
  userAddr = tabAddressGenerate[tabname](PREFIX, app.user.public);

  getValidatorState(
    ({ tabData }) => {
      console.log('tabdata found', tabData);
      if (tabData.length) {
        tabData.forEach(payloadObj => {
          constructTabhtml(payloadObj, true);
        });

        if (tabname === 'health-targets') {
          initChart(app.health, app.user.name, '#health-final');
        }
      }
      if (tabname === 'contact') {
        doSinglePageSaveHandling(tabData.length);
      }
    },
    userAddr,
    tabname
  );
};

app.update = function(payLoadArr, isMessage, $this) {
  console.log(this.user);
  if (this.user) {
    submitUpdate(payLoadArr, this.user.private, function(response) {
      if (response) {
        if (response.error) {
          console.log(response.error);
        } else if (response.data[0].status === 'INVALID') {
          alertBox(response.data[0].invalid_transactions[0].message);
        } else {
          if (isMessage === 'vendorUser') {
            changeLoginStatus(true);
          } else if (isMessage === 'tabs' || isMessage === 'tabs-all') {
            app.state = 'normal';
            payLoadArr.forEach(payloadObj => {
              constructTabhtml(payloadObj);
            });
            if (isMessage === 'tabs-all') {
              app.singlePageSave = true;
              $('#next').remove();
              $('#home-tabs')
                .find("[data-toggle='items-listed']")
                .trigger('click');
            } else {
              $('#home-tabs')
                .find("[data-toggle='" + app.currentTab + "']")
                .trigger('click');
            }
          }
        }
      }
      if ($this) {
        removeLoader($this);
      }
    });
  }
};

$(document).on('click', '#logout', function() {
  sessionStorage.clear();
  if (pagename === 'payment-page') {
    window.location.href = 'index.html';
  } else {
    location.reload();
  }
});

const handleWebsocketResponse = allStateData => {
  if (app.state === 'edit') {
    console.log('user is in edit mode');
  } else {
    allStateData.forEach(data => {
      if (data.value) {
        const parsed = JSON.parse(atob(data.value));
        if (parsed.owner === app.user.public) {
          constructTabhtml(parsed);
        }
      } else if (data.type == 'DELETE') {
        console.log(data);
      }
    });
  }
};

app.user = { public: '' };

const diffDays = (time, currentTime) => {
  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var dayValue = Math.round(Math.abs((currentTime - time) / oneDay));
  app.daysLeft -= dayValue;
};

const calculateDaysDiff = callback => {
  getPaymentCountFromEthereum(app.userCreatedTime, function(
    paymentBalance,
    senderAddr,
    serverTime
  ) {
    app.daysLeft = Math.floor(Math.abs(paymentBalance / ONE_DAY_TOKEN_CHARGE));
    diffDays(app.userCreatedTime, serverTime);
    if (callback) {
      callback();
    }
  });
};

const handleAfterPaymentReceived = newBalance => {
  calculateDaysDiff(function() {
    if (app.daysLeft > 0) {
      window.location.href = 'index.html';
    } else {
      console.log('Still Token Required');
    }
  });
};

const submitPaymentToHyperLedger = (amount, senderAddr) => {
  const payLoadObj = calculatePayLoad('payment')(amount, senderAddr, app);
  app.update([payLoadObj], 'payment');
};

const uport = new Connect('AMCHART-DEV', {
  clientId: '2odgjwjGBwB92GfBB38d378wg2fNiLe1A3P',
  network: 'rinkeby',
  signer: SimpleSigner(
    '3b43363846e849a162d8af4ad249c80a8e0f67699ff2ce1310f61c6ba780a4ee'
  )
});

var timer = 0;
const initTimerForDiff = (paymentBalance, senderAddr, serverTime) => {
  app.daysLeft = Math.floor(Math.abs(paymentBalance / ONE_DAY_TOKEN_CHARGE));
  diffDays(app.userCreatedTime, serverTime);
  if (app.daysLeft > 0) {
    //submitPaymentToHyperLedger(paymentBalance, senderAddr)
    window.location.href = 'index.html';
  } else {
    timer = setTimeout(function() {
      getPaymentCountFromEthereum(app.userCreatedTime, initTimerForDiff);
    }, 3000);
  }
};

const startTimerForPayment = () => {
  clearTimeout(timer);
  timer = 0;
  getPaymentCountFromEthereum(app.userCreatedTime, initTimerForDiff);
};

const doAfterPaymentStuff = () => {
  if (pagename !== 'payment-page') {
    if (app.daysLeft > 0) {
      changeLoginStatus(true);
    } else {
      window.location.href = 'dashboard.html';
    }
  } else if (app.daysLeft > 0) {
    window.location.href = 'index.html';
  }
};

const watchCallback = paymentBalance => {
  getServerDate(function(serverTime) {
    app.daysLeft = Math.floor(Math.abs(paymentBalance / ONE_DAY_TOKEN_CHARGE));
    diffDays(app.userCreatedTime, serverTime);
    if (app.daysLeft > 0) {
      window.location.href = 'index.html';
    }
  });
};

const isUserExist = cb => {
  console.log('is user exist calld');
  let userAddr = tabAddressGenerate['vendorUser'](PREFIX, app.user.public);
  getValidatorState(
    ({ tabData }) => {
      if (tabData.length && tabData[0].owner === app.user.public) {
        let asset = '';
        try {
          asset = payLoadDecrypt(
            app.user.public,
            app.user.private,
            tabData[0].asset
          );
        } catch (e) {
          asset = payLoadDecrypt(
            app.user.public,
            app.user.private,
            tabData[0].asset,
            'test'
          );
        }
        app.userCreatedTime = parseInt(tabData[0].time, 10);
        cb(true);
      } else {
        cb(false);
      }
    },
    userAddr,
    'vendorUser'
  );
};

const userCreate = isTest => {
  let isMessage = 'vendorUser';
  const payLoadObj = calculatePayLoad[isMessage](isTest, app);
  app.update([payLoadObj], isMessage);
};

const createRoleBasedUser = () => {
  userCreate(false);
};

const proccedAfterSuccessfullLogin = () => {
  changeLoginStatus(true);
};

const login = cb => {
  isUserExist(function(value) {
    console.log('result call back ', value);
    if (value) {
      proccedAfterSuccessfullLogin();
    } else {
      cb();
    }
  });
};

const reqCredentials = cb => {
  uport
    .requestCredentials({
      requested: ['name', 'avatar', 'phone', 'country'],
      notifications: true // We want this if we want to recieve credentials
    })
    .then(credentials => {
      cb(credentials);
    })
    .catch(console.error);
};

const storeDatatoStorage = credentials => {
  app.user = makeKeyPair(
    credentials.publicKey,
    credentials.name,
    credentials.avatar
  );
  sessionStorage.setItem('credentials', JSON.stringify(credentials));
};

const initloginClick = () => {
  $(document).on('click', '#user-login', async () => {
    // Request credentials to login
    reqCredentials(credentials => {
      storeDatatoStorage(credentials);
      login(createRoleBasedUser);
    });
  });
};

const proccedToLogin = () => {
  if (pagename === 'payment-page') {
    window.location.href = 'index.html';
  } else {
    $('#user-login-div').removeClass('hide');
    initloginClick();
  }
};

const initStartApp = result => {
  PORTAL_USED_AS = result.portal;
  FAMILY = result.family;
  PREFIX = getAddress(FAMILY, 6);

  var credentials = sessionStorage.getItem('credentials');
  if (credentials !== null) {
    credentials = JSON.parse(credentials);
    app.user = makeKeyPair(
      credentials.publicKey,
      credentials.name,
      credentials.avatar
    );
    if (
      pagename === 'payment-page' &&
      (PORTAL_USED_AS === 'MED_PRAC' || !IS_PAYMENT_ENABLE)
    ) {
      window.location.href = 'index.html';
    } else {
      login(proccedToLogin);
    }
  } else {
    proccedToLogin();
  }
};

getPortal(initStartApp);
