import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import chalk from "chalk";
import open from "open";
import type { AppConsole } from "@log4brains/cli-common";
import { execNext, getL4bInstance, getNextJsDir } from "../utils";

type Deps = {
  appConsole: AppConsole;
};

type SystemError = Error & { code?: string };
function isSystemError(obj: unknown): obj is SystemError {
  return obj instanceof Error && "code" in obj;
}

export async function previewCommand(
  { appConsole }: Deps,
  port: number,
  openBrowser: boolean,
  adrSlug?: string
): Promise<void> {
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  // Disable React Fast Refresh for global preview to avoid import.meta in CJS helpers
  process.env.__NEXT_DISABLE_REACT_REFRESH = "true";
  process.env.NEXT_DISABLE_REACT_REFRESH = "true";
  // Treat undefined NODE_ENV as development for better DX in global preview
  // In global installs (next app under node_modules), force production-like dev to avoid
  // React Fast Refresh rewriting CJS helpers in node_modules.
  const nextDir = getNextJsDir();
  const isGlobalInstall = nextDir.includes("node_modules");
  const dev = !isGlobalInstall && (process.env.NODE_ENV === "development" || !process.env.NODE_ENV);

  appConsole.startSpinner("Log4brains is starting...");
  appConsole.debug(`Run \`next ${dev ? "dev" : "start"}\`...`);

  const app = next({
    dev,
    dir: getNextJsDir()
  });

  await execNext(async () => {
    await app.prepare();
  });

  /**
   * #NEXTJS-HACK (best-effort)
   * Historically we disabled Next.js incremental cache in dev to ensure fresh data on each render.
   * Next internals changed around v15, so we guard access and skip if not present.
   */
  try {
    const anyApp: any = app as any;
    const incCache = anyApp?.server?.incrementalCache;
    const incOpts = incCache?.incrementalOptions;
    if (incOpts) {
      incOpts.dev = true;
    } else {
      // Newer Next versions: nothing to tweak, continue without failing
    }
  } catch {
    // Ignore if internals differ; preview will proceed without the tweak
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const srv = createServer(app.getRequestHandler());

  // FileWatcher with Socket.io
  const io = new SocketIOServer(srv);

  const { fileWatcher } = getL4bInstance();
  fileWatcher.subscribe((event) => {
    appConsole.debug(`[FileWatcher] ${event.type} - ${event.relativePath}`);
    io.emit("FileWatcher", event);
  });
  fileWatcher.start();

  try {
    await execNext(
      () =>
        new Promise((resolve, reject) => {
          // This code catches EADDRINUSE error if the port is already in use
          srv.on("error", reject);
          srv.on("listening", () => resolve());
          srv.listen(port);
        })
    );
  } catch (err) {
    appConsole.stopSpinner();

    if (isSystemError(err) && err.code === "EADDRINUSE") {
      if (openBrowser && adrSlug) {
        appConsole.println(
          chalk.dim(
            "Log4brains is already started. We open the browser and exit"
          )
        );
        await open(`http://localhost:${port}/adr/${adrSlug}`);
        process.exit(0);
      }

      appConsole.fatal(
        `Port ${port} is already in use. Use the -p <PORT> option to select another one.`
      );
      process.exit(1);
    } else if (isSystemError(err) && err.code === "EACCES") {
      appConsole.fatal(
        `Impossible to use port ${port} (permission denied). Use the -p <PORT> option to select another one.`
      );
      process.exit(1);
    }

    throw err;
  }

  appConsole.stopSpinner();
  appConsole.println(
    `Your Log4brains preview is 🚀 on ${chalk.underline.blueBright(
      `http://localhost:${port}/`
    )}`
  );
  appConsole.println(
    chalk.dim(
      "Hot Reload is enabled: any change you make to a markdown file is applied live"
    )
  );

  if (dev) {
    appConsole.println();
    appConsole.println(
      `${chalk.bgBlue.white.bold(" DEV ")} ${chalk.blue(
        "Next.js' Fast Refresh is enabled"
      )}`
    );
    appConsole.println();
  }

  if (openBrowser) {
    await open(`http://localhost:${port}/${adrSlug ? `adr/${adrSlug}` : ""}`);
  }
}
