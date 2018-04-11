'use strict';

const alertBox = content => {
  $.alert({
    title: 'Info!',
    content: content,
    useBootstrap: false
  });
};

const initConfirmBox = (content, confirmCb, cancelCb) => {
  $.confirm({
    title: 'Confirm!',
    content: content,
    useBootstrap: false,
    buttons: {
      confirm: function() {
        confirmCb();
      },
      cancel: function() {
        cancelCb();
      }
    }
  });
};

module.exports = {
  alertBox,
  initConfirmBox
};
