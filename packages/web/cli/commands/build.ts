import chalk from "chalk";
import build from "next/dist/build";
import exportApp from "next/dist/export";
import { trace as nextTrace } from "next/dist/trace";
import loadConfig from "next/dist/server/config";
import { PHASE_EXPORT } from "next/constants";
import path from "path";
import mkdirp from "mkdirp";
import { makeBadge } from "badge-maker";
import { promises as fsP } from "fs";
import type { AppConsole } from "@log4brains/cli-common";
import { Search } from "@lib-shared/search";
import { toAdrLight } from "@lib-shared/types";
import { execNext, getL4bInstance, getNextJsDir } from "../utils";

type Deps = {
  appConsole: AppConsole;
};

export async function buildCommand(
  { appConsole }: Deps,
  outPath: string,
  basePath: string
): Promise<void> {
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  appConsole.println("Building Log4brains...");

  const nextDir = getNextJsDir();
  // eslint-disable-next-line global-require,import/no-dynamic-require,@typescript-eslint/no-var-requires
  const nextConfig = require(path.join(nextDir, "next.config.js")) as Record<
    string,
    unknown
  >;

  // Use the default Next.js dist directory
  const distDir = ".next";
  const nextCustomConfig = {
    ...nextConfig,
    basePath,
    env: {
      ...(nextConfig.env && typeof nextConfig.env === "object"
        ? nextConfig.env
        : {}),
      NEXT_PUBLIC_LOG4BRAINS_STATIC: "1",
    },
  };

  appConsole.debug("Run `next build`...");
  await execNext(async () => {
    // #NEXTJS-HACK: build() is not meant to be called from the outside of Next.js
    // And there is an error in their typings: `conf?` is typed as `null`, so we have to use @ts-ignore

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await build(nextDir, nextCustomConfig);
  });

  appConsole.debug("Run `next export`...");
  await execNext(async () => {
    const exportFn = exportApp as unknown as (
      dir: string,
      options: {
        outdir: string;
        nextConfig?: unknown;
        enabledDirectories?: { app: boolean; pages: boolean };
        numWorkers?: number;
      },
      span?: unknown
    ) => Promise<void>;
    const loadConfigFn = loadConfig as unknown as (
      phase: string,
      dir: string,
      conf: unknown
    ) => Promise<unknown>;

    const resolvedConfig = await loadConfigFn(
      PHASE_EXPORT,
      nextDir,
      nextCustomConfig
    );

    type TraceSpan = {
      traceChild: (name: string) => TraceSpan;
      traceAsyncFn: <T>(fn: () => Promise<T>) => Promise<T>;
    };
    const span: TraceSpan = (nextTrace as unknown as (name: string) => TraceSpan)(
      "log4brains-export"
    );

    await exportFn(
      nextDir,
      {
        outdir: outPath,
        nextConfig: resolvedConfig,
        // Hint Next export about enabled directories; our app uses the Pages router
        enabledDirectories: { app: false, pages: true },
        numWorkers: 1,
      },
      span as unknown
    );
  });

  appConsole.startSpinner("Generating ADR data...");
  const buildId = await fsP.readFile(
    path.join(nextDir, distDir, "BUILD_ID"),
    "utf-8"
  );

  // TODO: move to a dedicated module
  await mkdirp(path.join(outPath, "data", buildId));
  const adrs = await getL4bInstance().searchAdrs();

  // TODO: remove this dead code when we are sure we don't need a JSON file per ADR

  // const packages = new Set<string>();
  // adrs.forEach((adr) => adr.package && packages.add(adr.package));
  // const mkdirpPromises = Array.from(packages).map((pkg) =>
  //   mkdirp(path.join(outPath, `data/adr/${pkg}`))
  // );
  // await Promise.all(mkdirpPromises);

  const promises = [
    // ...adrs.map((adr) =>
    //   fsP.writeFile(
    //     path.join(outPath, "data", buildId, "adr", `${adr.slug}.json`),
    //     JSON.stringify(
    //       toAdr(
    //         adr,
    //         adr.supersededBy ? getAdrBySlug(adr.supersededBy, adrs) : undefined
    //       )
    //     ),
    //     "utf-8"
    //   )
    // ),
    fsP.writeFile(
      path.join(outPath, "data", buildId, "adrs.json"),
      JSON.stringify(adrs.map(toAdrLight)),
      "utf-8"
    ),
  ];
  await Promise.all(promises);

  // Badge
  await fsP.writeFile(
    path.join(outPath, "badge.svg"),
    makeBadge({
      label: "ADRs",
      message: adrs.length.toString(),
      color: "#FF007B",
    })
  );

  appConsole.updateSpinner("Generating search index...");
  await fsP.writeFile(
    path.join(outPath, "data", buildId, "search-index.json"),
    JSON.stringify(Search.createFromAdrs(adrs).serializeIndex()),
    "utf-8"
  );

  appConsole.stopSpinner();
  appConsole.success(
    `Your Log4brains static site was successfully generated to ${chalk.cyan(
      outPath
    )} with a total of ${chalk.cyan(`${adrs.length} ADRs`)}`
  );
  appConsole.println();
  process.exit(0); // otherwise Next.js's spinner keeps running
}
