const express = require("express");
const app = express();
const path = require("path")
const routes = require("./routes.js")


app.set("view engine",'ejs');
app.set("views", path.join(__dirname, "views"))


app.get("/", routes);
app.post("/register", routes);
app.get("/register", routes);
app.get("/login", routes);
app.post("/login", routes);
app.get("/home", routes);
app.get("/logout", routes);


app.listen(80, ()=>{
    console.log("connected")
})