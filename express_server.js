var express = require("express");
var morgan = require('morgan');
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

//middleware
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['asdf'],

  // Cookie Options
}))

/*--functions--*/
//generates a user ID
function generateRandomString() {
  let alphnum = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  let randomURL = '';
  for (let i = 0; i < 6; i++) {
    randomURL += alphnum[Math.floor(Math.random()*36)];
  }
  return randomURL;
}

//makes a user object
function urlsForUser(id) {
  let filteredData = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      filteredData[shortURL] = {
        'userID': id,
        'longURL': urlDatabase[shortURL].longURL,
      };
    }
  }
  return filteredData;
}

//urls Data
var urlDatabase = {
  // "b2xVn2": {
  //   userID: 'userRandomID',
  //   longURL: "http://www.lighthouselabs.ca"
  //   }
};
//user database
const users = {
 //  "user3RandomID": {
 //    id: "user3RandomID",
 //    email: "example@email.com",
 //    hashedPassword: "asdf"
 //  }
};

/*---------------------------PAGES----------------------------------------------------------------------------------*/
//JSON URL database
app.get("/urls.json", (req, res) => {
  res.json(users);
});

//URLS PAGE
app.get("/urls", (req, res) => {
  const user_urls = urlsForUser(req.session['user_id']);
  const templateVars = {
    urls: user_urls,
    user: users[req.session['user_id']]
  };
  if (!req.session['user_id']) {
    res.redirect("/login");
  }
  res.render("urls_index", templateVars);
})
//CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  if (!req.session['user_id']) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});
//EDIT PAGE
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session['user_id']]
    };
  if (!req.session['user_id']) {
    res.redirect("/login");
  }
  res.render("urls_show", templateVars);
})
//REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
})
//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    user: false
  };
  res.render("login", templateVars);
})
/*-----------------------------------------------------------------------------------------------------------------------*/
/*-------------FEATURES-----------------------------------------------------------------------------------------------------*/
//creates a new url and renders it on /urls page
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    'userID': req.session['user_id'],
    'longURL': longURL,
  };
  console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});
//edit url
app.post("/urls/:id/edit", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session['user_id']) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
  }
  res.redirect("/urls")
})
//delete url
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session['user_id']) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls")
})
//shortURL link
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
/*-------------------------------------------------------------------------------------------------------------------*/
/*-------------LOGIN AND REGISTRATION--------------------------------------------------------------------------------*/
//Registration endpoint
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let registered = false;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email) {
    res.status(400).send("Error 400: no email entered!");
  }
  if (!password) {
    res.status(400).send("Error 400: no password enterd!");
  }
  for (let id in users) {
    if (users[id].email === email) {
      registered = true;
      res.status(400).send("Already registered! Please log in.");
    }
  }
  if (registered === false){
    users[user_id] = {
      'id': user_id,
      'email': email,
      'password': hashedPassword
    }
  }
  console.log(users[user_id]);
  req.session['user_id'] = user_id;
  res.redirect("/urls");
})
//Login endpoint
app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session['user_id'] = users[user].id;
      res.redirect("/urls");
      return;
    }
  }
  if (!req.body.email) {
    res.status(403).send("Error: Missing email!");
  }
  if (!req.body.password) {
    res.status(403).send("Error: Missing password!")
  }
})
//Logs user out and removes session cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})
/*-------------------------------------------------------------------------------------------------------------------*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
