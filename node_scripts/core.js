
const colors = require('colors/safe');

const args = process.argv.splice(process.execArgv.length + 2);
let isProduction = false;
args.forEach(arg => {
  if (arg === '-p' || arg === '-P' || arg === '--production') {
    isProduction = true;
  }
});

module.exports = {
  isProduction: isProduction,
  args: args,
  colors: colors
};
