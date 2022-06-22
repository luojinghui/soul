const CracoLessPlugin = require('craco-less');
const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1f1f1f',
              '@link-color': '#1f1f1f',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    alias: {
      '@': path.resolve('src'),
    },
  },
};
