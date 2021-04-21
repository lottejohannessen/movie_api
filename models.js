const mongoose = require('mongoose');
let movieSchema = mongoose.Schema({
    Title: {type: String, required:true},
    Description: {type: String, required:true},
    genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured:Boolean
});

let userSchema = mongoose.Schema({
    Username:{type: String, required: true},
    Password:{type: String, required: true},
    Email: {type:String, required: true},
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref:'Movie'}]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;

const bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.OnjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};