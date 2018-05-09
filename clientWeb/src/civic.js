'use strict';

const $ = require('jquery');
const { alertBox } = require('./confirm-dialog');

const civicSip = new civic.sip({ appId: 'rJjZu0eCG' });

$(document).on('click', '#signupButton', async () => {
  civicSip.signup({
    style: 'popup',
    scopeRequest: civicSip.ScopeRequests.BASIC_SIGNUP
  });
});

const initCivic = cb => {
  // Listen for data
  civicSip.on('auth-code-received', function(event) {
    // encoded JWT Token is sent to the server
    var jwtToken = event.response;
    sendAuthCode(jwtToken);
  });

  civicSip.on('user-cancelled', function(event) {});

  civicSip.on('read', function(event) {});

  // Error events.
  civicSip.on('civic-sip-error', function(error) {
    // handle error display if necessary.
    console.log('   Error type = ' + error.type);
    console.log('   Error message = ' + error.message);
  });

  const sendAuthCode = token => {
    $.post('/api/authenticate', { token }, res => {
      if (res.error) {
        alertBox('There is some problem in authentication.');
      } else {
        cb(res.body);
      }
    });
  };
};

module.exports = {
  initCivic
};
