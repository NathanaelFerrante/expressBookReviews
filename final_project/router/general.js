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

// Promise function to get the dictionary of books.
const getBooks = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(books);
        } catch (err) {
            reject("Error getting books.");
        }
    });
};

// Get the book list available in the shop (using an async call to the promise function).
public_users.get('/', async function (req, res) {
    try {
        const retreivedBooks = await getBooks();
        return res.send(JSON.stringify(retreivedBooks, null, 4));
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Promise function to get a book by ISBN.
const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
        try {
            resolve(books[isbn]);
        } catch (err) {
            reject("Error getting book by ISBN.");
        }
    });
};

// Get book details based on ISBN (using an async call to the promise function).
public_users.get('/isbn/:isbn',async function (req, res) {
  let isbn = req.params.isbn

  try {
    const bookWithIsbn = await getBookByIsbn(isbn);

    if (bookWithIsbn) {
        return res.send(JSON.stringify(bookWithIsbn, null, 4));
    } else {
        return res.status(404).send(`Book with ISBN not found.`);
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Promise function to get a book by author.
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        try {
            // Make a list of new book objects.
            const booksWithAuthor = Object.entries(books)
                // Use a filter to grab all books with a matching author.
                // Passing '([isbn, book])' takes the default values from books (isbn key and book value) and assigns them to isbn and book.
                .filter(([isbn, book]) => {
                    return book.author === author
                })
                // Use a map to turn the filtered item into a new array.
                // Passing '([isbn, book])' takes the default values from books (isbn key and book value) and assigns them to isbn and book.
                // '...book,' will copy into the array all values from the book dict.
                // '"isbn": isbn' will add the "isbn" key and the ISBN as the value.
                .map(([isbn, book]) => ({
                    ...book,
                    "isbn": isbn
                }));
            resolve (booksWithAuthor);
        } catch (err) {
            reject("Error getting book(s) by author.");
        }
    });
};

// Get book details based on author (using an async call to the promise function).
public_users.get('/author/:author', async function (req, res) {
    let author = req.params.author

    try {
        let booksWithAuthor = await getBooksByAuthor(author);
        if (booksWithAuthor.length === 0){
            return res.status(404).send("Author not found.");
        } else {
            return res.send(JSON.stringify(booksWithAuthor, null, 4));
        }
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Promise function to get a book by author.
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        try {
            // Make a list of new book objects.
            const booksWithTitle = Object.entries(books)
                // Use a filter to grab all books with a matching title.
                // Passing '([isbn, book])' takes the default values from books (isbn key and book value) and assigns them to isbn and book.
                .filter(([isbn, book]) => {
                    return book.title === title
                })
                // Use a map to turn the filtered item into a new array.
                // Passing '([isbn, book])' takes the default values from books (isbn key and book value) and assigns them to isbn and book.
                // '...book,' will copy into the array all values from the book dict.
                // '"isbn": isbn' will add the "isbn" key and the ISBN as the value.
                .map(([isbn, book]) => ({
                    ...book,
                    "isbn": isbn
                }));
            resolve (booksWithTitle);
        } catch (err) {
            reject("Error getting book(s) by title.");
        }
    });
};

// Get book details based on title (using an async call to the promise function).
public_users.get('/title/:title', async function (req, res) {
    let title = req.params.title

    try {
        let booksWithTitle = await getBooksByTitle(title);
        if (booksWithTitle.length === 0){
            return res.status(404).send("Title not found.");
        } else {
            return res.send(JSON.stringify(booksWithTitle, null, 4));
        }
    } catch (err) {
        return res.status(500).send(err);
    }
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
