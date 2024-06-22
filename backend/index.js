const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { exec } = require("child_process");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const port = 3001;

const upload = multer({ dest: "uploads/" });

app.use(cors());

app.get("/search", async (req, res) => {
  const query = req.query.query;
  console.log("Received query:", query);

  const apiKey = "89974ce9588110861cd0a4d7ddf7c64bde78834ea50224e36f0521c2e2e04ea9"; // Replace with your actual SerpApi key
  const url = `https://serpapi.com/search.json?engine=google_shopping&api_key=${apiKey}&q=${encodeURIComponent(query)}`;

  console.log("Request URL:", url);

  try {
    const response = await axios.get(url);
    const products = response.data.shopping_results || [];

    const productDetails = products.map((product) => ({
      link: product.link,
      thumbnail: product.thumbnail,
      title:product.title,
      price:product.price,
    }));

    console.log("Products:", productDetails);
    res.json({
      products: productDetails,
    });
  } catch (error) {
    console.error("Error fetching data from SerpApi:", error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      message: error.message,
    });
  }
});

app.post("/upload", upload.single("video"), (req, res) => {
  const videoPath = req.file.path;

  exec(`python process.py ${videoPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).send("Error processing video");
    }
    if (stderr) {
      console.error(`Error in script: ${stderr}`);
      return res.status(500).send("Error processing video");
    }

    const framesDir = path.join(__dirname, "frames");

    fs.readdir(framesDir, async (err, files) => {
      if (err) {
        console.error(`Error reading frames directory: ${err.message}`);
        return res.status(500).send("Error reading frames directory");
      }

      const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/.test(file));
      const searchPromises = imageFiles.map(async (image) => {
        const apiKey = "89974ce9588110861cd0a4d7ddf7c64bde78834ea50224e36f0521c2e2e04ea9"; // Replace with your actual SerpApi key
        const url = `https://serpapi.com/search.json?engine=google_shopping&api_key=${apiKey}&q=online_shopping`;

        try {
          const response = await axios.get(url);
          const products = response.data.shopping_results || [];

          return products.map((product) => ({
            link: product.link,
            thumbnail: product.thumbnail,
            title:product.title,
            price:product.price,
          }));
        } catch (error) {
          console.error(`Error in image search: ${error.message}`);
          throw error; // Propagate the error for proper error handling
        }
      });

      try {
        const results = await Promise.all(searchPromises);
        const flattenedResults = results.flat(); // Flatten array of arrays

        // Send the response only once after all promises are resolved
        res.json({ products: flattenedResults.slice(0, 10) });
      } catch (searchError) {
        console.error(`Error in image search: ${searchError.message}`);
        res.status(500).send("Error searching for images");
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

