console.log("Starting...");

import cluster from "cluster";
import path from "path";
import fs from "fs";
import yargs from "yargs";
import CFonts from "cfonts";
import Readline from "readline";
const rl = Readline.createInterface(process.stdin, process.stdout);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

CFonts.say("BOT BY\n HYZER", {
  colors: ["blueBright", "yellowBright"],
  font: "block",
  align: "center",
});
CFonts.say(`BY HYZER OFFICIAL`, {
  colors: ["yellow"],
  font: "console",
  align: "center",
});

var isRunning = false;
/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
  if (isRunning) return;
  isRunning = true;
  let args = [path.join(file), ...process.argv.slice(2)];
  CFonts.say([process.argv[0], ...args].join(" "), {
    font: "console",
    align: "center",
    gradient: ["red", "magenta"],
  });
  cluster.setupMaster({
    exec: path.join(file),
    args: args.slice(1),
  });
  let p = cluster.fork();
  p.on("message", (data) => {
    console.log("[RECEIVED]", data);
    switch (data) {
      case "reset":
        p.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case "uptime":
        p.send(process.uptime());
        break;
    }
  });
  p.on("exit", (code) => {
    isRunning = false;
    console.error("Exited with code:", code);
    if (code === 0) return;
    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
      start(file);
    });
  });
  let opts = new Object(
    yargs(process.argv.slice(2)).exitProcess(false).parse()
  );
  if (!opts["test"])
    if (!rl.listenerCount())
      rl.on("line", (line) => {
        p.emit("message", line.trim());
      });
}

start("main.js");
