const express = require("express");
const path = require("path");
const app = express();
const port = 8000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Send the chess.html file when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chess.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
