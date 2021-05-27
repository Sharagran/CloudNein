const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const generator = require('generate-password');
const db = require("./Database");
const fs = require("fs");
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const util = require('util');

//TODO: alle callbacks durch promises ersetzen
const readData = util.promisify(db.readData);
const comp_hash = util.promisify(compare_hash);

//Hasht das Passwort
function hash_password(password, callback) {
  bcrypt.hash(password, 10, function (error, hash) {
    if (error) {
      throw error;
    }
    console.log('Your hash: ', hash);
    callback(error, hash);
  });
};

//Vergleicht zwei hashes
function compare_hash(password, hashFromDB, callback) {
  bcrypt.compare(password, hashFromDB, function (error, match) {
    if (error) {
      throw error;
    } else {
      callback(error, match);
    }
  });
};

//Passwort vergessen funktion
function sendNewPassword(receiver, newPassword, callback) {

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'cloudneinofficial@gmail.com', pass: 'CloudNein' }, });
  var mailOptions = { from: 'cloudneinofficial@gmail.com', to: receiver, subject: 'Your CloudNein Password', text: "Your new password: " + newPassword };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      console.log('Email sent: ' + info.response);
      callback(error, info);
    };
  });
};

function generatePassword() {
  var newPW = generator.generate({ length: 6, numbers: true })
  console.log('Generated Password: ' + newPW);
  return newPW
};



async function login(username, password) {
  var error, result = await readData("User", { Username: username });

  if (error)
    throw error;

  if (result.length > 0) {
    var user = result[0];

    var error, match = await comp_hash(password, user.Password);
    if (error)
      throw error;

    if (match) {
      console.log("Matching password: true");
      return user;
    } else {
      console.log("Matching password: false");
    };
  }
  else {
    console.log(password, username);
    console.log("Login fehlgeschlagen");
  }
}

function register(email, username, password) {
  //prüfen, ob Name und Email vorhanden sind, wen nicht dann hashen und speichern
  console.log(email);
  db.readData("User", { Username: username, Email: email }, (error, result) => {
    if (error) {
      throw error;
    } else if (result.length > 0) {
      console.log("Username or Email ist already taken");
    } else {
      console.log(result);
      hash_password(password, (error, hash) => {
        if (error) throw error;
        db.createData("User", [{ Username: username, Password: hash, Email: email }], (error, result) => {
          if (error) throw error;
          console.log(result);
          fs.mkdir("../UserFiles/"+ username, function(err) {
            if (err) {
              console.log(err)
            } else {
              console.log("New directory successfully created.")
            }
          })
        });
      });
    };
  });
}

function forgotPassword(email) {
  console.log(email);
  db.readData('User', { Email: email }, (error, result) => {
    if (error) {
      throw error;
    } else if (result.length < 1) {
      console.log("Email nicht gefunden");
    } else {
      newPassword = generatePassword();
      hash_password(newPassword, (error, hash) => {
        if (error) throw error;
        db.updateData("User", { Email: email }, { $set: { Password: hash } }, (error, result) => {
          if (error) throw error;
          console.log(result);
        })
        sendNewPassword(result[0].Email, newPassword, (error, info) => {
          if (error) throw error;
        });
      })
    };
  });
}

function sign(user) {
  const payload = { username: user.Username, email: user.Email };
  const token = jwt.sign(payload, config.secret, { expiresIn: '1m' }); //FIXME: expiresIn

  return token;
}

function verify(token) {
  var data = jwt.verify(token, config.secret);
  return data;
}

module.exports = {
  login: login,
  register: register,
  forgotPassword: forgotPassword,
  sign: sign,
  verify: verify
}
