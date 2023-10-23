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
  const keyPattern = /^[0-9a-zA-Z]+$/;
  
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

      db.get("SELECT max_visits, visit_count FROM stats WHERE key = ?", [key], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
        }

        if (row) {
          if (row.max_visits !== 0 && row.visit_count >= row.max_visits) {
            db.run("DELETE FROM urls WHERE key = ?", [key], (err) => {
              if (err) {
                console.error("Error deleting URL from database:", err);
                return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
              }

              db.run("DELETE FROM stats WHERE key = ?", [key], (err) => {
                if (err) {
                  console.error("Error deleting stats from database:", err);
                  return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
                }
              });
            });
          }
        } else {
          return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
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
  const customUrl = req.body.customUrl.replace("/", "");
  const useCustomUrl = req.body.useCustomUrl == "true";
  const customVisits = req.body.customVisits;
  const useCustomVisits = req.body.useCustomVisits == "true";
  const keyPattern = /^[0-9a-zA-Z]+$/;
  
  if (useCustomUrl) {
    if (customUrl.length > 128) {
      return res.status(413).render("error", { errorCode: 413, errorMessage: "Request Entity Too Large", site: config.siteURL })
    }
    if (!keyPattern.test(customUrl)) {
      return res.render("index", { successMessage: null, errorMessage: "Invalid Custom URL Format", site: config.siteURL });
    }
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
      if (err.statusCode >= 400 && err.statusCode < 500) {
        res.render("index", { successMessage: null, errorMessage: err.message, site: config.siteURL });
      } else {
        console.error(err);
        res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
      }
    });
});

module.exports = router;