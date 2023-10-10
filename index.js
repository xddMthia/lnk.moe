const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const fs = require("fs");

const db = new sqlite3.Database(path.join(__dirname, "data", "app.db"));

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS urls (key TEXT PRIMARY KEY, url TEXT)",
    (err) => {
      if (err) {
        console.error("Error creating 'urls' table:", err);
      } else {
        console.log("Database table 'urls' created or already exists.");
      }
    }
  );
});

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

function isValidURL(str) {
  const pattern = /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/;
  const regex = new RegExp(pattern);
  return regex.test(str) && !str.includes("lnk.moe");
}

function generateUniqueKey(url, hashLength = 6) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(3).toString("hex");
    const hash = crypto.createHash("sha1").update(url).digest("hex").substr(0, hashLength);

    db.get("SELECT url FROM urls WHERE key = ?", [hash], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        if (row.url === url) {
          resolve(hash);
        } else {
          const salt = crypto.randomBytes(3).toString("hex");
          const saltedHash = crypto.createHash("sha1").update(url + salt).digest("hex").substr(0, ++hashLength);
          generateUniqueKey(url, hashLength).then(resolve).catch(reject);
        }
      } else {
        db.run("INSERT INTO urls (key, url) VALUES (?, ?)", [hash, url], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", { successMessage: null, errorMessage: null });
});

app.get("/:key", (req, res) => {
  const key = req.params.key;

  db.get("SELECT url FROM urls WHERE key = ?", [key], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error" });
    }

    if (row) {
      res.redirect(row.url);
    } else {
      res.status(404).render("error", { errorCode: 404, errorMessage: "URL Not Found" });
    }
  });
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: / \nAllow: /$");
});

app.post("/", (req, res) => {
  const url = req.body.url;

  if (!isValidURL(url)) {
    return res.render("index", { successMessage: null, errorMessage: "Invalid URL" });
  }

  generateUniqueKey(url)
    .then((key) => {
      res.render("index", { successMessage: "URL shortened successfully", shortUrl: `https://lnk.moe/${key}`, errorMessage: null });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).render("error", { errorCode: 500, errorMessage: "Internal Server Error" });
    });
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const errorCode = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  console.error(err);

  res.status(errorCode).render("error", { errorCode, errorMessage });
});

app.listen(6971);
