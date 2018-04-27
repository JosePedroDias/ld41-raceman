const path = require('path');

module.exports = {
  entry: {
    main: './src/main.ts',
    exposePolyDecomp: './src/exposePolyDecomp.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  mode: process.env.NODE_ENV || 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
    //sourceMapFilename: '[name].[hash:8].map',
    //chunkFilename: '[id].[hash:8].js'
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    historyApiFallback: {
      index: 'dist/index.html'
    }
  },
  performance: {
    hints: false
  }
};
