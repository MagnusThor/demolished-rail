const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "demo": "./build/wwwroot/src/demo.js",
        "fol06" :"./build/wwwroot/src/Fol06.js"
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