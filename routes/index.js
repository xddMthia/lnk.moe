const express = require("express");
const path = require("path");
const config = require(path.join(__dirname, "..", "config"));
const db = require(path.join(__dirname, "..", "db", "db"));
const { isValidURL, generateUniqueKey } = require(path.join(__dirname, "..", "utils", "shortUtils"));
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { site: config.siteURL, successMessage: null, errorMessage: null });
});

router.get("/:key", (req, res) => {
  const key = req.params.key;
  const keyPattern = /^[0-9a-fA-F]+$/;
  
  if (!keyPattern.test(key)) {
    return res.status(400).render("error", { errorCode: 400, errorMessage: "Invalid URL Format", site: config.siteURL });
  }

  db.get("SELECT url FROM urls WHERE key = ?", [key], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
    }

    if (row) {
      db.run("UPDATE stats SET timestamp = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE key = ?", [key], (err) => {
        if (err) {
          console.error("Error updating visit stats:", err);
          return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
        }
      });

      db.get("SELECT url FROM stats WHERE key = ?", [key], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
        }

        if (row) {
          // visits > max visits
        }
      });

      res.redirect(row.url);
    } else {
      res.status(404).render("error", { errorCode: 404, errorMessage: "URL Not Found", site: config.siteURL });
    }
  });
});

router.post("/", (req, res) => {
  const url = req.body.url;
  const customUrl = req.body.customUrl;
  const useCustomUrl = req.body.useCustomUrl == "true";
  const customVisits = req.body.customVisits;
  const useCustomVisits = req.body.useCustomVisits == "true";

  console.log(useCustomUrl, customUrl, useCustomVisits, customVisits);
  console.log(typeof(useCustomUrl), typeof(customUrl), typeof(useCustomVisits), typeof(customVisits));
  if (useCustomUrl && customUrl.length > 128) {
    return res.status(413).render("error", { errorCode: 413, errorMessage: "Request Entity Too Large", site: config.siteURL })
  }

  if (useCustomVisits && parseInt(customVisits) < 1) {
    return res.render("index", { successMessage: null, errorMessage: "Invalid Custom Visits", site: config.siteURL });
  }

  if (url.length > 1024) {
    return res.status(413).render("error", { errorCode: 413, errorMessage: "Request Entity Too Large", site: config.siteURL })
  }

  if (!isValidURL(url)) {
    return res.render("index", { successMessage: null, errorMessage: "Invalid URL", site: config.siteURL });
  }

  generateUniqueKey(url, useCustomUrl, customUrl, useCustomVisits, customVisits)
    .then((key) => {
      res.render("index", { successMessage: "URL shortened successfully", shortUrl: `https://${config.siteURL}/${key}`, errorMessage: null, site: config.siteURL });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
    });
});

module.exports = router;