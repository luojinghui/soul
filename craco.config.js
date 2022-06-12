const CracoLessPlugin = require('craco-less');

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
};
