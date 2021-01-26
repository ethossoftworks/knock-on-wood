const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const packageName = "KnockOnWood"

const prodConfig = {
    entry: `./src/${packageName}.ts`,
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
    plugins: [new CleanWebpackPlugin()],
    output: {
        filename: `${packageName}.js`,
        path: path.resolve(__dirname, "dist"),
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
            path: path.resolve(__dirname, "dist"),
        },
    },
}

module.exports = (env) => (env.prod ? prodConfig : testConfig)
