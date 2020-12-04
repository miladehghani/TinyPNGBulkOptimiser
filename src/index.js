const { estimation, optimise } = require("./imageOptimiser");

const vars = process.argv.slice(2);
let path = "";
let keys = [];
let est = false;

for (let i = 0; i < vars.length; i++) {
  switch (vars[i]) {
    case "est":
      est = true;
      break;
    case "path":
      path = vars[i + 1];
      break;
    case "keys":
      keys = vars.slice(i + 1);
  }
}

if (path && est) estimation(path);
else if (!path) console.log("Please set the path");
else if (keys.length == 0)
  console.log("Please set at least one Tinify API KEY using alias keys");
else optimise(keys, path);
