const path = require("path")

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
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: `${packageName}.js`,
        path: path.resolve(__dirname, "dist")
    }
}

const testConfig = {
    ...prodConfig,
    ...{
        entry: `./src/${packageName}.test.ts`,
        mode: "development",
        target: "node",
        output: {
            filename: `${packageName}.test.js`,
            path: path.resolve(__dirname, "dist")
        }
    }
}

module.exports = env => {
    switch (env) {
        case "prod":
            return prodConfig
        case "test":
            return testConfig
    }
}
