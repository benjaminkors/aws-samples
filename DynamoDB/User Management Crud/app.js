require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/UsersDbRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// Use the user-defined routes
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
