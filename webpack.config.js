var HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
      },
      {
        test: /\.less$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "less-loader" }],
      },
    ],
  },
  resolve: {
    mainFiles: ["index", "Index"],
    extensions: [".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    historyApiFallback: true,
    inline: true,
    host: "0.0.0.0",
    port: 3000,
  },
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: "http://localhost:8000",
    }),
  },
};
