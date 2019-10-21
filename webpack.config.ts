import path from 'path';

module.exports = {
    entry: {
        bundle: './src/index.ts'
    },
    mode: 'development',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/, loader: 'ts-loader'
            }
        ]
    }
};
