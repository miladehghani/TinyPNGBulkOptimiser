const Optimise = require("./imageOptimiser");

const vars = process.argv.splice(2);
let path = "";
let keys = [];

for (let i = 0; i < vars.length; i++) {
  switch (vars[i]) {
    case "--path":
      path = vars[i + 1];
      break;
    case "--keys":
      keys = vars.splice(i + 1);
  }
}
if (!path) console.log("Please set the --path");
if (keys.length)
  console.log("Please set at least one Tinify API KEY using alias --key");

Optimise(keys, path);
