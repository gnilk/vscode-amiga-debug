const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { pathToFileURL } = require('url');

module.exports = (env, argv) => {
	var config = {
		entry: "./src/client/client.tsx",
		output: {
			filename: "client.bundle.js",
			chunkFilename: "client.bundle.[id].js"
		},
		devtool: (argv.mode === 'development') ? 'source-map' : undefined,
		resolve: {
			extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
			alias: {
				"react": "preact/compat",
				"react-dom": "preact/compat",
			}
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: "ts-loader",
					options: { configFile: 'tsconfig.client.json' },
				},
				{
					test: /\.css$/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
								modules: {
									auto: /\.module\.css$/i,
									localIdentName: (argv.mode === 'development') ? '[folder][name]__[local]' : '[hash:base64]',
								},
								sourceMap: argv.mode === 'development',
							},
						}
					],
				},
				{
					test: /\.svg$/,
					loader: 'svg-inline-loader',
				},
				{
				  test: /\.(vert|frag)$/,
				  loader: 'raw-loader',
				},
		  
			],
		},
		plugins: [
			new webpack.optimize.LimitChunkCountPlugin({
				maxChunks: 1
			}),
			new CleanWebpackPlugin(),
		],
		devServer: {
			open: true,
			contentBase: path.join(__dirname, 'src/test/suite/data/output/')
		}
	};
	
	return config;
};