const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const defaults = {
    entry: './poc',
    output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.js' },
    plugins: [new Dotenv()]
  };

  if (!env) throw new Error('You must pass --env flag to webpack');

  if (env.prod || env.production) {
    return Object.assign(defaults, {
      /* prod conf here */
    });
  } else {
    /* dev */
    return Object.assign(defaults, {
      devtool: 'eval-source-map',
      watch: true,
      watchOptions: { aggregateTimeout: 600, ignored: /node_modules/ }
    });
  }
};