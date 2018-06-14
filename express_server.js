var express = require("express");
var morgan = require('morgan');
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//middleware?
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static('TinyApp' + '/public'));

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "example@email.com",
    password: "asdf"
  }
};

/*---------------------------PAGES----------------------------------------------------------------------------------*/
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies['user_id']]
    };
  res.render("urls_show", templateVars);
})

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: false
  };
  res.render("login", templateVars);
})
/*-----------------------------------------------------------------------------------------------------------------------*/
/*-------------FEATURES-----------------------------------------------------------------------------------------------------*/
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
/*-------------------------------------------------------------------------------------------------------------------*/
/*-------------LOGIN AND REGISTRATION--------------------------------------------------------------------------------*/
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  users[user_id] = {
    'id': user_id,
    'email': email,
    'password': password
  }
  if (!email || !password) {
    res.status(400).send("Error: 400");
  }
  res.cookie('user_id', user_id);
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('user_id', users[user].id);
      res.redirect("/");
      return
    }
  }
  res.status(403).send("Error: 403");
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})
/*-------------------------------------------------------------------------------------------------------------------*/

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
