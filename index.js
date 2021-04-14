const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.use(bodyParser.json());

let topMovies = [
  {
    title: 'The Shawshank Redemption',
    director: ' ',
    year: 1994
  },
  {
    title: 'The Godfather',
    director: ' ',
    year: 1972
    },
  {
    title: 'The Godfather: Part II',
    director: ' ',
    year: 1974
    },
  {
    title: 'The Dark Knight',
    director: ' ',
    year: 2008
    },
  {
    title: 'Angry Men',
    director: ' ',
    year: 1957
    },
    {
      title: 'Schindler\'s List',
      director: ' ',
      year: 1993
    },
    {
      title: 'The Lord of the Rings: The Return of the King',
      director: ' ',
      year: 2003
      },
    {
      title: 'The Godfather: Part II',
      director: ' ',
      year: 1974
      },
    {
      title: 'Pulp Fiction',
      director: ' ',
      year: 1994
      },
    {
      title: 'Fight Club',
      director: ' ',
      year: 1999
      }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Something Obvious! lol');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies',  (req, res) => {
  res.json(topMovies);
});

// Get data about a single movie, by title
app.get('/movies/:Title', (req, res) => {
  res.json(topMovies.find(movie => {
    return movie.title === req.params.Title
  }));
});

// Get data about a genre by movie title
app.get('/movies/Genres/:Title', (req, res) => {
  res.send('Fight Club & The Dark Knight')
});

// Get data about a director by name
app.get('/movies/Directors/:Name', (req, res) => {
  res.send('Francis Ford Coppola is an American film director, producer and screen writer. He was a central figure in the New Hollywood filmaking movement of the 1960s and 70s, and is widely considered to be one of the greatest filmmakers of all time.')
});



// Post new user registration
app.post('/users',(req, res) => {
 Users.findOne({ Username: req.body.Username })
 .then((user) => {
   if (user) {
     return res.status(400).send(req.body.Username + 'already exists');
   } else{
     Users
     .create({
       Username: req.body.Username,
       Password: req.body.Password,
       Email: req.body.Email,
       Birthday: req.body.Birthday
     })
     .then((user) => {res.status(201).json(user) })
     .catch((error) => {
       console.error(error);
       res.status(500).send('Error: ' + error);
     })
    }
})
.catch((error) => {
  console.error(error);
  res.status(500).send('Error: ' + error);
  });
});

// Get all users
app.get('/users',  (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
    });
  });

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' +err);
    });
  });

// Put updates to user information
app.put('/users/:Username',(req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
  {
    Username: req.body.Username,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }
  },
{ new: true }, 
(err,updateUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updateUser);
    }
  });
});

// Allows users to add a movie to their list of favorites
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username
  }, {
    $push: {FavouriteMovies: req.params.MovieID }
  },
  { new: true}, 
  (err,updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
      }
    });
  });

// Deletes a movie from list of user's favorites
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
  res.send('deletes a movie from list of users favorites');
});

// Deletes a user from registration database
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + 'was not found');
    }else {
      res.status(200).send(req.params.Username + 'was deleted.');
    }
  })
  .catch((err)=> {
    console.error(err);
    res.status(500).send('Error: ' + err);
    });
  });


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});