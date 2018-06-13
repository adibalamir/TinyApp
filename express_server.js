var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//middleware?
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  let alphnum = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  let randomURL = '';
  for (let i = 0; i < 6; i++) {
    randomURL += alphnum[Math.floor(Math.random()*36)];
  }
  return randomURL;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
    };
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls")
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
