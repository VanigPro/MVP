'use strict';

const { WEBSOCKET_URL } = require('./../../config');

var isWebSocketStart = false;
const initWebSocket = (prefix, cb) => {
  let ws = new WebSocket(WEBSOCKET_URL);
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        action: 'subscribe',
        address_prefixes: [prefix]
      })
    );
  };
  ws.onmessage = message => {
    const data = JSON.parse(message.data);
    var allState = data.state_changes;
    if (isWebSocketStart && allState.length) {
      cb(allState);
    }
    isWebSocketStart = true;
  };

  ws.onclose = e => {
    console.log(e);
  };

  ws.onerror = e => {
    console.log(e);
  };
};

module.exports = {
  initWebSocket
};
