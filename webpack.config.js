const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "runsWgslShaderOnly": "./build/wwwroot/src/runsWgslShaderOnly.js",
        "runShaderScene" :"./build/wwwroot/src/runShaderScene.js",
        "runScene" :"./build/wwwroot/src/runScene.js",
        "runComputeShader" : "/build/wwwroot/src/runComputeShader.js"
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