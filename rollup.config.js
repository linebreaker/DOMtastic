import minimist from 'minimist';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import excludeModules from './build/rollup.plugin.excludeModules.js';
import redirectModules from './build/rollup.plugin.redirectModules.js';

var argv = minimist(process.argv.slice(2));
var exclude = argv.exclude ? argv.exclude.split(',') : [];
var include = argv.include ? argv.include.split(',') : [];
var jQueryCompat = argv['jquery-compat'];

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  dest: 'dist/domtastic.js',
  format: 'umd',
  moduleName: '$',
  sourceMap: true,
  plugins: [
      excludeModules({
          exclude: exclude,
          include: include
      }),
      redirectModules({
          enabled: jQueryCompat,
          path: 'src-jquery-compat'
      }),
      babel(),
      replace({
          __VERSION__: pkg.version
      })
  ]
};
