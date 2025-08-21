const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "runWorld" :"./build/wwwroot/src/GameRunner.js"
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