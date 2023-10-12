const crypto = require("crypto");
const path = require("path");
const db = require(path.join(__dirname, "..", "db", "db"));
const config = require(path.join(__dirname, "..", "config"));

function isValidURL(str) {
  const pattern = /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/;
  const regex = new RegExp(pattern);
  return regex.test(str) && !str.includes(config.siteURL);
}

function generateUniqueKey(url, hashLength = 6) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha1").update(url).digest("hex").substr(0, hashLength);

    db.get("SELECT url FROM urls WHERE key = ?", [hash], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        if (row.url === url) {
          resolve(hash);
        } else {
          hashLength++;
          generateUniqueKey(url, hashLength).then(resolve).catch(reject);
        }
      } else {
        db.run("INSERT INTO urls (key, url) VALUES (?, ?)", [hash, url], (err) => {
          if (err) {
            reject(err);
          } else {
            db.run("INSERT INTO stats (key) VALUES (?)", [hash], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(hash);
              }
            });
          }
        });
      }
    });
  });
}

module.exports = {
  isValidURL,
  generateUniqueKey
}