
const CLI = require('./node_scripts/cli');
const TestConfig = require('./node_scripts/test-config');

// TestConfig.allCmds.push('hi');

CLI.Config = TestConfig;

CLI.init();

// CLI.registerCmd('hi', 'My first command', [], (args, isProduction) => {
//   console.log('My 1st cmd executed :)');
// });

CLI.run();
