const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();

const passport = require('passport');
require('./passport');

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080','http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application doesnt allow access from origin' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

app.use(morgan('common'));

app.use(express.static('public'));

app.use(bodyParser.json());
let auth = require('./auth')(app);

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
app.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.send('welcome to myFlix!');
});

app.get('/documentation', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then(movies => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get data about a single movie, by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}) , (req, res) => {
  res.json(topMovies.find(movie => {
    return movie.title === req.params.Title
  }));
});

// Get data about a genre by movie title
app.get('/movies/Genres/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  let genre = req.params.name;
  Movies.findOne({"Genre.Title" : genre}).then((genreTitle)=>
  {
    res.status(202).json(genreTitle.Genre)
  }).catch((error) =>
  {
    console.log(error);
    res.status(500).send("Error 500: " + error)
  })
});

// Get data about a director by name
app.get('/movies/Directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  let director = req.params.name;
  Movies.findOne({"Director.Name" : director}).then((directorName) =>
  {
    res.status(202).json(directorName.Director)
  }).catch((error) =>
  {
    console.log(error);
    res.status(500).send("Error 500: " + error)
  })
});

// Post new user registration
app.post('/users', [ 
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', {session: false}), (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

 let hashedPassword = Users.hashPassword(req.body.Password);
 Users.findOne({Username: req.body.Username })
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username +' already exists');
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) => { res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});

// Get all users
app.get('/users', passport.authenticate('jwt', {session: false}),  (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
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
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  let favourite = req.params.movieId;
  let user = req.params.username;
  Users.findOneAndUpdate({Username: user},
    { $pull:
    {
      FavouriteMovies : favourite
    }
  }).then((user) =>
  {
    if(!user)
    {
      res.status(400).send(req.params.username + 'was not found')
    } else
    {
      res.status(200).send(req.params.movieId + ' was deleted.');
    }
  }).catch((error) =>
  {
    console.log(error);
    res.status(500).send("Error: " + error)
  })
})

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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

