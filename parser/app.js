const express = require("express");
const mongoose = require("mongoose");
const { readFilesRecursively } = require("./parse");
const app = express();
const port = 3000;
require("./db");

readFilesRecursively("../shallas-blacklist/BL");

app.listen(port, () => {
  console.log(`Uygulama http://localhost:${port} adresinde çalışıyor.`);
});
