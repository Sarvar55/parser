const Category = require("./Schema");
const fs = require("fs");
const path = require("path");

// This function recursively reads files from a folder and saves the category data to the database
async function readFilesRecursively(folderPath) {
  const files = fs.readdirSync(folderPath);
  const categoryData = {
    name: path.basename(folderPath),
    domains: [],
    urls: [],
  };

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // If the file is a directory, call the function recursively
      await readFilesRecursively(filePath);
    } else {
      // If the file is not a directory, check its extension
      const ext = path.basename(file);
      if (ext === "domains" || ext === "urls") {
        // If the file extension is .domains or .urls, read the lines from the file
        const lines = await readLinesFromFile(filePath);

        // Save the domains and urls to the category data object
        saveDomainsAndUrls(ext, lines, categoryData);
      }
    }
  }

  // Save the category data to the database
  await saveCategory(categoryData);

  console.log(`Folder "${folderPath}" successfully processed.`);
}

// This function reads lines from a file and returns them as an array
async function readLinesFromFile(filePath) {
  return new Promise((resolve, reject) => {
    const lines = [];
    const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

    readStream.on("data", (chunk) => {
      // Split the chunk by newline characters and add them to the lines array
      const chunkLines = chunk.split("\n");
      lines.push(...chunkLines);
    });

    readStream.on("end", () => {
      // Filter out empty lines and resolve the promise with the lines array
      resolve(lines.filter((line) => line.trim() !== ""));
    });

    readStream.on("error", (err) => {
      // Reject the promise with the error
      reject(err);
    });
  });
}

// This function saves the category data to the database
async function saveCategory(categoryData) {
  try {
    // Check if the category already exists in the database
    const categoryExists = await checkCategoryExist(categoryData.name);

    if (categoryExists) {
      // If the category exists, update it with the new data
      await Category.findOneAndUpdate(
        { name: categoryData.name },
        { $set: categoryData },
        { new: true }
      );
      console.log(`Category "${categoryData.name}" successfully updated.`);
    } else {
      // If the category does not exist, create it with the new data
      // Split the domains and urls arrays into chunks to avoid exceeding document size limit
      const CHUNK_SIZE = 1000;
      const domainsChunks = chunkArray(categoryData.domains, CHUNK_SIZE);
      const urlsChunks = chunkArray(categoryData.urls, CHUNK_SIZE);

      for (const chunk of domainsChunks) {
        // Save each chunk of domains as a new document
        categoryData.domains = chunk;
        await saveCategoryChunk(categoryData);
      }

      for (const chunk of urlsChunks) {
        // Save each chunk of urls as a new document
        categoryData.urls = chunk;
        await saveCategoryChunk(categoryData);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// This function saves a chunk of category data as a new document
async function saveCategoryChunk(categoryData) {
  try {
    const newCategory = new Category(categoryData);
    await newCategory.save();
  } catch (err) {
    console.error("Error:", err);
  }
}

// This function splits an array into smaller arrays of a given size
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// This function saves the domains and urls to the category data object
function saveDomainsAndUrls(ext, lines, categoryData) {
  // Get the target array based on the file extension
  const targetArray =
    ext === "domains" ? categoryData.domains : categoryData.urls;
  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // Add the trimmed line to the target array
      targetArray.push(trimmedLine);
    }
  });
  return targetArray;
}

// This function checks if a category exists in the database by name
const checkCategoryExist = async (categoryName) => {
  try {
    const category = await Category.findOne({ name: categoryName });
    return !!category;
  } catch (err) {
    console.error("Database error:", err);
    return false;
  }
};

module.exports = {
  readFilesRecursively,
};
