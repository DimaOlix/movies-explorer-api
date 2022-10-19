const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
},
{
  toObject: { useProjection: true },
  toJSON: { useProjection: true },
},
{
  versionKey: false,
});

module.exports = mongoose.model('User', userSchema);
