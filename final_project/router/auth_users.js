const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session');
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    //write code to check is the username is valid
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

const authenticatedUser = (username,password)=>{ //returns boolean
    //write code to check if username and password match the one we have in records.
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    
    // Return false if no users have username.
    if (userswithsamename.length <= 0) {
        return false;
    }

    // Access the user with username.
    let userwithsamename = userswithsamename[0];

    // Return true if the password matches the saved password.
    if (userwithsamename.password === password) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let username = req.session.username;
    let isbn = req.params.isbn;
    let review = req.query.review;

    if (!(isbn in books)) {
        return res.status(404).send("ISBN not found.");
    }

    if (!(username in books[isbn].reviews)) {
        books[isbn].reviews[username] = review;
        return res.send("Review: '" + review + "' successfully posted.");
    } else {
        books[isbn].reviews[username] = review;
        return res.send("Review: '" + review + "' successfully updated.");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.session.username;
    let isbn = req.params.isbn;
    let review = req.query.review;

    if (!(isbn in books)) {
        return res.status(404).send("ISBN not found.");
    }

    if (username in books[isbn].reviews) {
        let review = books[isbn].reviews[username];
        delete books[isbn].reviews[username];
        return res.send("Review: '" + review + "' successfully deleted.");
    } else {
        return res.send("Review not found for given ISBN.")
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
