load("//tools/bzl:js.bzl", "polygerrit_plugin")

polygerrit_plugin(
    name = "image-diff",
    srcs = glob(["**/*.html", "**/*.js"]),
    app = "plugin.html",
    deps = ["//lib/js:resemblejs"],
)