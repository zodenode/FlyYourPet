#!/usr/bin/env node
/**
 * Prepares the app for static export by temporarily moving api/ and admin/
 * (server-dependent routes) so next build with output: 'export' can succeed.
 * Restores them after build.
 */
const fs = require("fs");
const path = require("path");

const APP = path.join(__dirname, "..", "src", "app");
const API = path.join(APP, "api");
const ADMIN = path.join(APP, "admin");
const TMP_API = path.join(APP, "_api.bak");
const TMP_ADMIN = path.join(APP, "_admin.bak");

function move(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${path.basename(src)} -> ${path.basename(dest)}`);
  }
}

const mode = process.argv[2] || "backup"; // backup | restore

if (mode === "backup") {
  move(API, TMP_API);
  move(ADMIN, TMP_ADMIN);
} else if (mode === "restore") {
  move(TMP_API, API);
  move(TMP_ADMIN, ADMIN);
} else {
  console.error("Usage: node prepare-static-export.js [backup|restore]");
  process.exit(1);
}
