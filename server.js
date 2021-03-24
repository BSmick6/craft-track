const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const data = require("./scrape");

let crafts;

data().then((result) => {
  crafts = result;
});

setInterval(() => {
  data().then((result) => {
    crafts = result;
  });
}, 3600000);

app.use(cors());

app.get("/", (req, res) => {
  if (crafts) {
    res.json(crafts);
  } else {
    res.send("results aren't ready yet");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
