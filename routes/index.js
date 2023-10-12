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

  db.get("SELECT url FROM urls WHERE key = ?", [key], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
    }

    if (row) {
      res.redirect(row.url);

      db.run("UPDATE stats SET timestamp = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE key = ?", [key], (err) => {
        if (err) {
          console.error("Error updating visit stats:", err);
          return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
        }
      });
    } else {
      res.status(404).render("error", { errorCode: 404, errorMessage: "URL Not Found", site: config.siteURL });
    }
  });
});

router.post("/", (req, res) => {
  const url = req.body.url;

  if (url.length > 1024) {
    return res.status(413).render("error", { errorCode: 413, errorMessage: "Request Entity Too Large", site: config.siteURL })
  }

  if (!isValidURL(url)) {
    return res.render("index", { successMessage: null, errorMessage: "Invalid URL", site: config.siteURL });
  }

  generateUniqueKey(url)
    .then((key) => {
      res.render("index", { successMessage: "URL shortened successfully", shortUrl: `https://${config.siteURL}/${key}`, errorMessage: null, site: config.siteURL });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error", site: config.siteURL });
    });
});

module.exports = router;