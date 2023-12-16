import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default defineConfig({
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        json(),
        terser({
            ecma: 2020,
        }),
        {
            closeBundle() {
                if (!process.env.ROLLUP_WATCH) {
                    setTimeout(() => process.exit(0));
                }
            },
            name: 'force-close'
        },
    ],
    input: './src/main.js',
    output: {
        format: 'es',
        name: '[name].js',
        dir: './dist',
    },
    external: [],
});
