const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "echoes-of-the-ethersea": "./build/wwwroot/src/demo/runner.js",
    
        
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