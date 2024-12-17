const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require("./package.json").dependencies;

const printCompilationMessage = require('./compilation.config.js');

module.exports = (_, argv) => ({
    output: {
        publicPath: "http://localhost:8080/",
    },

    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
        port: 8080,
        historyApiFallback: true,
        watchFiles: [path.resolve(__dirname, 'src')],
        onListening: function (devServer) {
            const port = devServer.server.address().port

            printCompilationMessage('compiling', port)

            devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
                setImmediate(() => {
                    if (stats.hasErrors()) {
                        printCompilationMessage('failure', port)
                    } else {
                        printCompilationMessage('success', port)
                    }
                })
            })
        }
    },

    module: {
        rules: [
            {
                test: /\.m?js/,
                type: "javascript/auto",
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.(css|s[ac]ss)$/i,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: [{
                    loader: "@svgr/webpack"
                },
                    {
                        loader: "file-loader"
                    }],
            },
        ],
    },

    plugins: [
        new ModuleFederationPlugin({
            name: "host",
            filename: "remoteEntry.js",
            remotes: {
                'auth': 'auth@http://localhost:8083/remoteEntry.js',
                'feed': 'feed@http://localhost:8081/remoteEntry.js',
            },
            exposes: {},
            shared: {
                ...deps,
                react: {
                    singleton: true,
                    requiredVersion: deps.react,
                },
                "react-dom": {
                    singleton: true,
                    requiredVersion: deps["react-dom"],
                },
            },
        }),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
        }),
        new Dotenv()
    ],
});