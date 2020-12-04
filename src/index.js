const { key } = require("tinify");
const Optimise = require("./imageOptimiser");

const vars = process.argv.slice(2);
let path = "";
let keys = [];
for (let i = 0; i < vars.length; i++) {
  switch (vars[i]) {
    case "--path":
      path = vars[i + 1];
      break;
    case "--keys":
      keys = vars.slice(i + 1);
  }
}

if (!path) console.log("Please set the --path");
else if (keys.length == 0)
  console.log("Please set at least one Tinify API KEY using alias --keys");
else Optimise(keys, path);
