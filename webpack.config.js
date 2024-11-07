const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "demo": "./build/wwwroot/src/demo.js",
        "runsWgslShaderOnly": "./build/wwwroot/src/runsWgslShaderOnly.js",
        "runShaderScene" :"./build/wwwroot/src/runShaderScene.js"

    },
    output: {
        path: __dirname + "/wwwroot/js/",
        filename: "[name]-bundle.js"
    },
    plugins: [
    ],
    module: {

    },
    externals: {
    }
}