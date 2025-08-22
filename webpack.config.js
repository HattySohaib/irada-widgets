// webpack.config.js
module.exports = {
  entry: "./src/index.js", // Entry point to your component library
  mode: "production",
  output: {
    path: __dirname + "/dist",
    filename: "index.js",
    libraryTarget: "umd", // This makes the library usable in various environments
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // Add this rule for CSS files
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], // Handle JSX files
  },
  externals: {
    react: "react", // Treat React as an external dependency
    "react-dom": "react-dom",
    "react-router-dom": "react-router-dom", // Add this line
  },
};
