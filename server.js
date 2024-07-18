const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'my-secret-key', resave: false, saveUninitialized: true }));
app.use(cors());
app.use(express.json());

const users = [];

// Middleware Connections
app.use(cors())
app.use(express.json())

//BookList
const books = [
    {
      title: "The Catcher in the Rye",
      ISBN: "9333",
      author: "Salinger",
      review: "Best"
    },
    {
      title: "To Kill a Mockingbird",
      ISBN: "9000",
      author: "HarperLee",
      review: "Good"
    },
    {
      title: "1984 WAR CRY",
      ISBN: "9456",
      author: "GeorgeOrwell",
      review: "Best"
    }
  ];
  



// Routes

//task 1
app.get('/', (req, res) => {
    // const booklist = books.map(()=>{
        
    // })
    const bookList = books.map(book => `${book.title} by ${book.author}`).join('\n');
    res.send(`My Book List:\n${bookList}`);
})

// app.get('/:ISBN', (req, res) => {
//     // const Bookisbn = books.filter((book) => book.ISBN == ISBN)
//     // res.send(``)

//task 2
app.get('/api/ISBN/:ISBN', (req, res) => {
    const requestedISBN = req.params.ISBN;
    const bookWithRequestedISBN = books.find((book) => book.ISBN === requestedISBN);

    if (bookWithRequestedISBN) {
    res.json(bookWithRequestedISBN);
    } else {
    res.status(404).send('Book not found');
    }
});

//task 2
// app.get('/api/:author', (req, res) => {
//     const requestedAuthor = req.params.author
//     const bookwithauthor = books.find((book)=> book.author === requestedAuthor )

//     if(bookwithauthor) {
//         res.json(bookwithauthor)
//     }
//     else {
//         res.status(404).send(`Book with the author ${requestedAuthor} not found`)
//     }
// })
app.get('/api/author/:author', (req, res) => {
    const requestedAuthor = req.params.author;
    const booksByAuthor = books.filter((book) => book.author === requestedAuthor);
  
    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
    } else {
      res.status(404).send(`No books found for author: ${requestedAuthor}`);
    }
  });

  //task4

  app.get(('/api/title/:title'),(req, res) => {
    const requestedtitle = req.params.title;

    const bookwithtitle = books.filter((book) => requestedtitle === book.title)

    if(bookwithtitle.length > 0) {
        res.json(bookwithtitle)
    } else {
        res.status(404).send(`Book with the title: ${requestedtitle} not found `)
    }
  })

  //task5

  app.get('/api/review/:review', (req, res) => {
    const reqreview = req.params.review
    const bookreview = books.filter((book) => reqreview === book.review)
    if(bookreview.length > 0){
        res.send(bookreview)
    } else {
        res.status(404).send(`No Book Review`)
    }
  })

//Task6 Register user

// Registration form
app.get('/register', (req, res) => {
    res.send(`
      <form method="post" action="/register">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Register</button>
      </form>
    `);
  });
  
  // Handle registration
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
  
    // Save user (in-memory; replace with database logic)
    users.push({ username, password: hashedPassword });
  
    res.send('User registered successfully!');
  });

  // Task 8: Add/Modify a book review
app.post('/api/review', (req, res) => {
    const { ISBN, review, username } = req.body;
    const bookIndex = books.findIndex(book => book.ISBN === ISBN);
  
    if (bookIndex === -1) {
      return res.status(404).send('Book not found');
    }
  
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).send('User not authenticated');
    }
  
    books[bookIndex].review = review;
    res.json({ message: 'Review added/modified successfully', book: books[bookIndex] });
  });
  
  // Task 9: Delete book review added by that particular user
  app.delete('/api/review', (req, res) => {
    const { ISBN, username } = req.body;
    const bookIndex = books.findIndex(book => book.ISBN === ISBN);
  
    if (bookIndex === -1) {
      return res.status(404).send('Book not found');
    }
  
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).send('User not authenticated');
    }
  
    books[bookIndex].review = '';
    res.json({ message: 'Review deleted successfully', book: books[bookIndex] });
  });
  
  // Task 10: Get all books – Using async callback function
  app.get('/api/books', (req, res) => {
    const getAllBooks = async (callback) => {
      try {
        // Simulating an async operation
        await new Promise(resolve => setTimeout(resolve, 100));
        callback(null, books);
      } catch (error) {
        callback(error);
      }
    };
  
    getAllBooks((err, result) => {
      if (err) {
        res.status(500).send('Error retrieving books');
      } else {
        res.json(result);
      }
    });
  });
  
  // Task 11: Search by ISBN – Using Promises
  app.get('/api/books/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
  
    const findBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books.find(book => book.ISBN === isbn);
        if (book) {
          resolve(book);
        } else {
          reject('Book not found');
        }
      });
    };
  
    findBookByISBN(isbn)
      .then(book => res.json(book))
      .catch(error => res.status(404).send(error));
  });
  
  // Task 12: Search by Author
  app.get('/api/books/author/:author', async (req, res) => {
    const { author } = req.params;
  
    try {
      const booksByAuthor = books.filter(book => book.author.toLowerCase() === author.toLowerCase());
      if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
      } else {
        res.status(404).send('No books found for this author');
      }
    } catch (error) {
      res.status(500).send('Error searching for books');
    }
  });
  
  // Task 13: Search by Title
  app.get('/api/books/title/:title', async (req, res) => {
    const { title } = req.params;
  
    try {
      const booksByTitle = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      if (booksByTitle.length > 0) {
        res.json(booksByTitle);
      } else {
        res.status(404).send('No books found with this title');
      }
    } catch (error) {
      res.status(500).send('Error searching for books');
    }
  });



// Connection
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log('App running in port: '+PORT)
})