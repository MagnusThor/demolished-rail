const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "runsWgslShaderOnly": "./build/wwwroot/src/example/runsWgslShaderOnly.js",
        "runShaderScene" :"./build/wwwroot/src/example/runShaderScene.js",
        "runScene" :"./build/wwwroot/src/example/runScene.js",
        "runComputeShader" : "/build/wwwroot/src/example/runComputeShader.js",
        "editor" : "/build/wwwroot/src/editor/editor.js"
        
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