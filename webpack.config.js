const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

const packageName = "KnockOnWood"

const prodConfig = {
    entry: `./src/index.ts`,
    devtool: "source-map",
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, "package.json"), to: "./" },
                { from: path.resolve(__dirname, "README.md"), to: "./" },
                { from: path.resolve(__dirname, "LICENSE"), to: "./" },
            ],
        }),],
    output: {
        filename: `${packageName}.js`,
        path: path.resolve(__dirname, "build"),
        library: "KnockOnWood",
        libraryTarget: "umd",
        globalObject: "this",
    },
}

const testConfig = {
    ...prodConfig,
    ...{
        entry: `./src/${packageName}.test.ts`,
        mode: "development",
        target: "node",
        output: {
            filename: `${packageName}.test.js`,
            path: path.resolve(__dirname, "build"),
        },
    },
}

module.exports = (env) => (env.prod ? prodConfig : testConfig)
