const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = 'your mnemonic';
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          'https://ropsten.infura.io/YOUR_INFURA_KEY'
        );
      },
      network_id: '3',
      gas: 4600000
    },
    rinkeby: {
      host: 'localhost', // Connect to geth on the specified
      port: 8545,
      network_id: 4,
      gas: 4612388, // Gas limit used for deploys
	  from: '0x49Acd99A09e62EF9674D9FF1F56B2187eA824bfF'
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
