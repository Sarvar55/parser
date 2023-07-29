var mongoose = require("mongoose");
var dbUrl = "mongodb://127.0.0.1/blacklist";
mongoose.connect(dbUrl);

console.log("burası çalışmaya başladı");

mongoose.connection.on("connected", () => {
  console.log(dbUrl + "adresindeki veri tabanin abaglandi");
});

mongoose.connection.on("error", () => {
  console.log("Baglanti hatasi");
});

mongoose.connection.on("disconnected", () => {
  console.log("Baglanti kesilidi");
});

function close(msg, callback) {
  mongoose.connection.close(() => {
    console.log(msg);
    callback();
  });
}
process.on("SIGINT", () => {
  close("Uygulama kapatilidi", () => {
    process.exit(0);
  });
});

require("./Schema");
