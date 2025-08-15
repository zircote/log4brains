const path = require("path");
const fs = require("fs");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

const packageJson = require(`${
  fs.existsSync(path.join(__dirname, "package.json")) ? "./" : "../"
}package.json`);

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  // Disable ESLint during production builds to avoid requiring it at runtime
  // in consumer environments (e.g., when running via global CLI in temp dirs)
  eslint: {
    ignoreDuringBuilds: true
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname, // https://github.com/vercel/next.js/issues/8251
    VERSION: packageJson.version
  },
  webpack(config, { webpack, buildId }) {
    // For cache invalidation purpose (thanks https://github.com/vercel/next.js/discussions/14743)
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NEXT_BUILD_ID": JSON.stringify(buildId)
      })
    );

    // Removed legacy exclude override for older Next.js versions

    // To avoid issues with fsevents during the build, especially on macOS
    config.externals.push("chokidar");

    return config;
  },
  typescript: {
    // We check typescript errors only during the first build, not during "log4brains build",
    // for performance purpose and to avoid importing @types/* packages as dependencies
    // #NEXTJS-HACK Exception: typescript, @types/react and @types/node are required because of the Next.js verifyTypeScriptSetup() pre-checks
    // TODO: in the future, try to compile the Next.js app to JS during the build phase to avoid depending on typescript dependencies at the runtime
    ignoreBuildErrors: process.env.LOG4BRAINS_PHASE !== "initial-build"
  }
});
