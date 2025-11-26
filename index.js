const app = require("./app");
const http = require("http");
const { mogodbUrlConnect } = require("./config/db");
require("dotenv").config();

const server = http.createServer(app);
const PORT = process.env.PORT || 8001;

(async () => {
  try {
    await mogodbUrlConnect();
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`NODE.JS Express Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to DB connection issue:", error);
    process.exit(1);
  }
})();

// Compare this snippet from server.js:
// Define a simple route
// const express = require('express');
// // const https = require('https');
// const http=require('http');
// const fs = require('fs');
// const path = require('path');
// const app = require("./app");
// require('dotenv').config()
// require("./config/db").mogodbUrlConnect();

// // Start the server on port 443 (or your desired port)
// // Paths to your certificate and private key files
// const certPath = path.join(__dirname, 'public/ssl', 'gkmsinfotech_cert.crt'); // Replace with your cert path
// const keyPath = path.join(__dirname, 'public/ssl', 'gkmsinfotech.key'); // Replace with your key path
// const caPath = path.join(__dirname, 'public/ssl', 'gkmsinfotech_ca.crt'); // Replace with your ca path (if applicable)
// console.log(certPath, keyPath, caPath, "SSL Path");
// // Read the certificate and private key files
// const options = {
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath),
//     ca:fs.readFileSync(caPath)
// };

// // if (fs.existsSync(caPath)) { //Optional CA bundle.
// //     options.ca = fs.readFileSync(caPath);
// // }
// // Create the HTTPS server
// // const server = https.createServer(options, app);
// // const server=http.createServer(app);
// // const port = 8000; //or 8000, etc.
// // s.listen(port, () => {
// //     console.log(`Server listening on port ${port}`);
// // });

// app.set('trust proxy', true); // Trust the first proxy (for Heroku or similar platforms)
// const server = http.createServer(app);
// const port = process.env.PORT || 8000; // Use the PORT environment variable or default to 8000
// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
