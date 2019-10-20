import path from 'path';

module.exports = {
    entry: {
        bundle: './src/index.ts'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/, loader: 'ts-loader'
            }
        ]
    }
};
