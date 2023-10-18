const express = require("express");
const router = express.Router();

router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: / \nAllow: /$");
});

module.exports = router;