const express = require("express");
const fs = require("fs");
var session = require("express-session");
const multer = require("multer");
const db = require("./models/db");
const UserModel = require("./models/User");
const TodoModel = require("./models/Todo");

const app = express();

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: multerStorage });
app.set("view engine", "ejs");
app.use(upload.single("pic"));
app.use(express.static("uploads"));
app.use(
  session({
    secret: "node.js",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("index", { username: req.session.username, pic: req.session.pic });
});

app.get("/styles.css", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/styles.css");
});

app.get("/login", function (req, res) {
  res.render("login", { error: null });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});
app.get("/logout", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  req.session.destroy();
  res.redirect("/login");
});

app.post("/signup", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const phone = req.body.phone;
  const pic = req.file;

  const data = {
    username: username,
    password: password,
    email: email,
    phone: phone,
    pic: pic.filename,
  };
  UserModel.findOne({ username: username }).then(function (user) {
    if (user) {
      res.status(400).send("user already exists");
      return;
    } else {
      UserModel.create(data)
        .then(function () {
          res.redirect("/login");
        })
        .catch(function (err) {
          res.status(500).send("error");
        });
    }
  });
});
app.get("/upload", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.render("index", { username: req.session.username, pic: req.session.pic });
});
app.post("/upload", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }

  const todoText = req.body.todoText;
  const priority = req.body.priority;
  const pic = req.file;
  //console.log(pic);

  if (!todoText || !priority) {
    res.status(400).send("error");
    return;
  }
  const data = {
    userid: new Date().getTime().toString(),
    todoText,
    priority,
    completed: false,
    pic: pic.filename,
  };
  TodoModel.create(data)
    .then(function () {
      res.redirect("/");
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  UserModel.findOne({ username: username, password: password })
    .then(function (user) {
      if (!user) {
        res.render("login", { error: "Invalid username or password" });
        return;
      }
      req.session.username = req.body.username;
      req.session.isLoggedIn = true;
      req.session.pic = user.pic;
      res.render("index", {
        username: req.session.username,
        pic: req.session.pic,
      });
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});

app.post("/todo", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.status(401).send("unauthorized");
    return;
  }
  TodoModel.updateOne({ userid: req.body.userid }, { completed: true })
    .then(function () {
      res.status(200).send("success");
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});

app.get("/todo-data", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  TodoModel.find()
    .then(function (todos) {
      res.status(200).json(todos);
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});
app.get("/todoScript.js", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/todoScript.js");
});

app.post("/delete", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.status(401).send("unauthorized");
    return;
  }
  const userid = req.body.userid;
  TodoModel.deleteOne({ userid: userid })
    .then(function () {
      res.status(200).send("success");
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});

app.post("/update", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.status(401).send("unauthorized");
    return;
  }
  const id = req.body.userid;
  TodoModel.findOne({ userid: id })
    .then(function (todo) {
      if (!todo) {
        res.status(404).send("not found");
        return;
      }
      if (todo.completed !== true) {
        todo.completed = true;
      } else {
        todo.completed = false;
      }
      todo
        .save()
        .then(function () {
          res.status(200).send("success");
        })
        .catch(function (err) {
          res.status(500).send("error");
        });
    })
    .catch(function (err) {
      res.status(500).send("error");
    });
});

db.init()
  .then(function () {
    console.log("db connected");
    app.listen(3000, function () {
      console.log("server started at port 3000");
    });
  })
  .catch(function (err) {
    console.log(err);
  });
