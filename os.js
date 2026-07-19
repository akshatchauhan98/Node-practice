const os = require('os');

console.log("Your Operating System:", os.platform());
console.log("Your CPU:", os.cpus()[0].model);
console.log("Total RAM (GB):", (os.totalmem() / 1024 / 1024 / 1024).toFixed(2));
console.log("Free RAM (GB):", (os.freemem() / 1024 / 1024 / 1024).toFixed(2));