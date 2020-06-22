load("//tools/bzl:js.bzl", "polygerrit_plugin")
load("@npm_bazel_rollup//:index.bzl", "rollup_bundle")


polygerrit_plugin(
    name = "image-diff",
    app = "plugin-bundle.js",
)

rollup_bundle(
    name = "plugin-bundle",
    srcs = glob([
        "**/*.js",
    ]) + ["@plugins_npm//:node_modules"],
    config_file = "rollup.config.js",
    entry_point = "plugin.js",
    format = "iife",
    rollup_bin = "//tools/node_tools:rollup-bin",
    sourcemap = "hidden",
    deps = [
        "@tools_npm//rollup-plugin-node-resolve",
    ],
)