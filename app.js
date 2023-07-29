const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { log } = require("console");

const dbUrl = "mongodb://localhost:27017/shallas_blcklist";
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", () => {
  console.log(`${dbUrl} adresindeki veritabanına bağlandı.`);
});

mongoose.connection.on("error", (err) => {
  console.error("Bağlantı hatası:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Bağlantı kesildi.");
});

process.on("SIGINT", async () => {
  await close("Uygulama kapatıldı", () => {
    process.exit(0);
  });
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const CategorySchema = new mongoose.Schema({
  name: String,
  domains: [String],
  urls: [String],
});

const CategoryModel = mongoose.model("Category", CategorySchema);

CategoryModel.create({
  name: "deneme",
  domains: ["dnee"],
  urls: ["UrlSche"],
})
  .then((category) => {
    console.log(category + "başarılı bir şekilde oluştu");
  })
  .catch((error) => {
    console.log(error);
  });

// function readFilesRecursively(folderPath) {
//   const files = fs.readdirSync(folderPath);

//   for (const file of files) {
//     const filePath = path.join(folderPath, file);
//     const stat = fs.statSync(filePath);

//     if (stat.isDirectory()) {
//       console.log(filePath);
//       readFilesRecursively(filePath);
//     } else {
//       console.log(file);
//       if (file === "domains" || file === "urls") {
//         const data = fs.readFileSync(filePath, "utf8");
//         const lines = data.split("\n").filter((line) => line.trim() !== "");

//         const categoryName = path.basename(folderPath);
//         const categoryData = {
//           name: categoryName,
//           domains: [],
//           urls: [],
//         };
//         saveDomainsAndUrls(file, lines, categoryData);
//         saveCategory(categoryData);
//       }
//     }
//   }
//   console.log("İşlem başarıyla bitti.");
// }

async function saveCategory(categoryData) {
  try {
    const category = CategoryModel.create(categoryData);
    console.log(`Kategori "${categoryData.name}" başarıyla kaydedildi.`);
  } catch (err) {
    console.error("Hata:", err);
  }
}

function saveDomainsAndUrls(file, lines, categoryData) {
  const targetArray =
    file === "domains" ? categoryData.domains : categoryData.urls;
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      targetArray.push(
        file === "domains" ? { domain: trimmedLine } : { url: trimmedLine }
      );
    }
  });
}

async function close(msg, callback) {
  try {
    await mongoose.connection.close();
    console.log(msg);
    callback();
  } catch (err) {
    console.log(err);
  }
}

// readFilesRecursively("./shallas-blacklist/BL");
