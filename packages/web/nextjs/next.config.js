const path = require("path");
const fs = require("fs");

let withBundleAnalyzer = (cfg) => cfg;
try {
  // Optional in global installs; fall back if not present
  withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true"
  });
} catch (e) {
  // no-op: plugin unavailable, continue without analyzer
}

const packageJson = require(`${
  fs.existsSync(path.join(__dirname, "package.json")) ? "./" : "../"
}package.json`);

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  poweredByHeader: false,
  // trailingSlash can cause dev asset path issues; disable to keep /_next paths stable
  trailingSlash: false,
  // Ensure Next transpiles required packages when running from node_modules (global install)
  transpilePackages: [
    "@log4brains/web",
    "@mui/material",
    "@mui/system",
    "@mui/styles",
    "@mui/icons-material"
  ],
  // Disable ESLint during production builds to avoid requiring it at runtime
  // in consumer environments (e.g., when running via global CLI in temp dirs)
  eslint: {
    ignoreDuringBuilds: true
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname, // https://github.com/vercel/next.js/issues/8251
    VERSION: packageJson.version
  },
  webpack(config, { webpack, buildId, dev }) {
    // For cache invalidation purpose (thanks https://github.com/vercel/next.js/discussions/14743)
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.NEXT_BUILD_ID": JSON.stringify(buildId)
      })
    );

    // Replace problematic deep import with local shim irrespective of issuer
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /(^|\\\\|\/)lodash\/isEqual$/,
        path.join(__dirname, "aliases/lodash-isEqual.js")
      )
    );

    // Keep default Next SWC loaders for TS/TSX; no custom excludes here

    // To avoid issues with fsevents during the build, especially on macOS
    config.externals.push("chokidar");

    // Workaround for import.meta.webpackHot in @babel/runtime helpers during global preview
    // seen when running the globally installed CLI: alias to a safe helper.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@babel/runtime/helpers/extends": path.join(__dirname, "aliases/babel-extends.js"),
      "@babel/runtime/helpers/extends.js": path.join(__dirname, "aliases/babel-extends.js"),
      "@babel/runtime/helpers/interopRequireDefault": path.join(
        __dirname,
        "aliases/babel-interopRequireDefault.js"
      ),
      "@babel/runtime/helpers/interopRequireDefault.js": path.join(
        __dirname,
        "aliases/babel-interopRequireDefault.js"
      ),
      // Avoid parsing issues with CJS helper when transpiling MUI packages
      "@babel/runtime/helpers/objectWithoutPropertiesLoose": path.join(
        __dirname,
        "aliases/babel-objectWithoutPropertiesLoose.js"
      ),
      "@babel/runtime/helpers/objectWithoutPropertiesLoose.js": path.join(
        __dirname,
        "aliases/babel-objectWithoutPropertiesLoose.js"
      ),
      "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose": path.join(
        __dirname,
        "aliases/babel-objectWithoutPropertiesLoose.js"
      ),
      "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js": path.join(
        __dirname,
        "aliases/babel-objectWithoutPropertiesLoose.js"
      )
    };

    // Prefer resolving modules from this package's own node_modules during global installs
    const localNodeModules = [
      path.join(__dirname, "node_modules"),
      path.join(__dirname, "../node_modules"),
      path.join(__dirname, "../../../node_modules")
    ];
    const currentModules = Array.isArray(config.resolve.modules)
      ? config.resolve.modules
      : [];
    config.resolve.modules = Array.from(
      new Set([...localNodeModules, ...currentModules, "node_modules"]) 
    );

    // Ensure some modules resolve from this package when used by server pages
    try {
      const awilixEntry = require.resolve("awilix");
      config.resolve.alias["awilix"] = awilixEntry;
    } catch (_) {
      // ignore if not resolvable at config time
    }
    try {
      const mtz = require.resolve("moment-timezone");
      config.resolve.alias["moment-timezone"] = mtz;
    } catch (_) {
      // ignore if not resolvable at config time
    }
    try {
      const lodashEntry = require.resolve("lodash");
      config.resolve.alias["lodash"] = lodashEntry;
    } catch (_) {}
    // Force a local shim for lodash/isEqual to avoid resolution issues in global installs
    config.resolve.alias["lodash/isEqual"] = path.join(
      __dirname,
      "aliases/lodash-isEqual.js"
    );
    try {
      const lodashIsString = require.resolve("lodash/isString");
      config.resolve.alias["lodash/isString"] = lodashIsString;
    } catch (_) {}
    try {
      const lodashIsNumber = require.resolve("lodash/isNumber");
      config.resolve.alias["lodash/isNumber"] = lodashIsNumber;
    } catch (_) {}
    try {
      const lodashExtend = require.resolve("lodash/extend");
      config.resolve.alias["lodash/extend"] = lodashExtend;
    } catch (_) {}

    // Disable React Fast Refresh in dev to prevent import.meta being injected into CJS helpers
    if (dev && Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter(
        (plugin) => (plugin && plugin.constructor && plugin.constructor.name) !== "ReactRefreshPlugin"
      );
    }

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
