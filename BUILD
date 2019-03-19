load("//tools/bzl:genrule2.bzl", "genrule2")
load("//tools/bzl:js.bzl", "bundle_assets", "polygerrit_plugin")
load("//tools/bzl:plugin.bzl", "gerrit_plugin")

gerrit_plugin(
    name = "image-diff",
    srcs = ["java/com/googlesource/gerrit/plugins/imagediff/ImageDiffModule.java"],
    manifest_entries = [
        "Gerrit-PluginName: image-diff",
        "Gerrit-Module: com.googlesource.gerrit.plugins.codemirror.ImageDiffModule",
        "Implementation-Title: Image Diff plugin",
    ],
    resource_jars = [":image-diff-static"],
)

genrule2(
    name = "image-diff-static",
    srcs = [":image_diff"],
    outs = ["image-diff-static.jar"],
    cmd = " && ".join([
        "mkdir $$TMP/static",
        "cp -r $(locations :image_diff) $$TMP/static",
        "cd $$TMP",
        "zip -Drq $$ROOT/$@ -g .",
    ]),
)

bundle_assets(
    name = "image-diff-assets",
    srcs = glob(["gr-resemble-diff-mode/resemblejs-assets.html"]),
    app = "gr-resemble-diff-mode/resemblejs-assets.html",
    split = False,
    deps = [
        "//lib/js:resemblejs"
    ],
)

polygerrit_plugin(
    name = "image_diff",
    srcs = glob(["**/*.html", "**/*.js"]),
    app = "plugin.html",
    assets = [
        ":image-diff-assets"
    ],
)
