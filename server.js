const express = require("express");
const app = express();
const port = 8001;

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
})

app.listen(port, () => {
   console.log(`Server running on port: ${port}`);
});
