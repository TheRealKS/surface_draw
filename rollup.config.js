import { nodeResolve } from '@rollup/plugin-node-resolve';
import { uglify } from "rollup-plugin-uglify";

export default {
  input: ['ts/componentLoader.js', 'ts/draw.js', 'ts/init.js'],
  output: {
    dir: 'output',
    format: 'es'
  },
  plugins: [nodeResolve(), uglify()]
};