const express = require("express");
const app = express();
const exampleRouter = require("./routes/exampleRoute");

app.use(express.json());

// Example router
app.use("/api/example", exampleRouter);

module.exports = app;
