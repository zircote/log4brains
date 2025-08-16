import chalk from "chalk";
import { ConsoleCapturer } from "@log4brains/cli-common";
import { Log4brains } from "@log4brains/core";
import path from "path";
import fs from "fs";
import os from "os";

let l4bInstance: Log4brains;
export function getL4bInstance(): Log4brains {
  if (!l4bInstance) {
    l4bInstance = Log4brains.createFromCwd(process.env.LOG4BRAINS_CWD || ".");
  }
  return l4bInstance;
}

let cachedNextDir: string | null = null;
export function getNextJsDir(): string {
  if (cachedNextDir) return cachedNextDir;
  // Resolve @log4brains/web package root via Node
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
    const webPkgPath = require.resolve("@log4brains/web/package.json", {
      paths: [__dirname]
    });
    const webRoot = path.dirname(webPkgPath);
    cachedNextDir = path.join(webRoot, "nextjs");
    return cachedNextDir;
  } catch {
    // Fallback: relative to this compiled file (useful when running from repo)
    cachedNextDir = path.resolve(path.join(__dirname, "../nextjs"));
    return cachedNextDir;
  }
}

/**
 * #NEXTJS-HACK
 * We want to hide the output of Next.js when we execute CLI commands.
 *
 * @param fn The code which calls Next.js methods for which we want to capture the output
 */
export async function execNext(fn: () => Promise<void>): Promise<void> {
  const debug = !!process.env.DEBUG;

  const capturer = new ConsoleCapturer();
  capturer.onLog = (method, args, stream) => {
    if (stream === "stderr" || debug) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      capturer.doPrintln(...["[Next] ", ...args].map((a) => chalk.dim(a)));
    }
  };

  capturer.start();
  await fn();
  capturer.stop();
}
