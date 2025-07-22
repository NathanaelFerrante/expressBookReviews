const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn

  if (!(isbn in books)) {
        return res.status(404).send("ISBN not found.");
  }

  return res.send(JSON.stringify(books[isbn]));
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let author = req.params.author

    let booksWithAuthor = Object.values(books).filter(book => {
        return book.author === author;
    });

    if (booksWithAuthor.length === 0){
        return res.status(404).send("Author not found.");
    }

    return res.send(JSON.stringify(booksWithAuthor,null,2));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title

    let booksWithTitle = Object.values(books).filter(book => {
        return book.title === title;
    });

    if (booksWithTitle.length === 0){
        return res.status(404).send("Title not found.");
    }

    return res.send(JSON.stringify(booksWithTitle,null,2));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn

    if (!(isbn in books)) {
          return res.status(404).send("ISBN not found.");
    }

    return res.send(books[isbn].review);
});

module.exports.general = public_users;
