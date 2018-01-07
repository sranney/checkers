const args = ["start"];
const opts = { stdio: "inherit", cwd: "checkers", shell: true };
require("child_process").spawn("npm", args, opts);
