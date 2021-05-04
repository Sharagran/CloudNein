const express = require("express");
const app = express();
const PORT = 80;

app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`app listening at ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('yoyo');
});

app.get('*', (req, res) => {
    res.send('Error 404 page not found.', 404);
});