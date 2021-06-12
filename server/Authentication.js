const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const generator = require('generate-password');
const db = require("./Database");
const fs = require("fs");
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const util = require('util');
const { readDataPromise } = require('./Database');
const fm = require('./FileManager');
const uuidv4 = require('uuid').v4;
const { join } = require('path');

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
  var mailOptions = { 
    from: 'cloudneinofficial@gmail.com', 
    to: receiver, 
    subject: 'Your CloudNein Password', 
    text: "Your new password: " + newPassword 
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
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

async function changeUsername(userID, newUsername, previousUsername){
  var error, usernameCheck = await db.readDataPromise('user', {username: newUsername})
  console.log(usernameCheck);
  if(usernameCheck.length == 0){
    var error, result = await db.updateDataPromise('user', {id: userID}, {$set: {username: newUsername}})
    console.log(result);
    fs.rename("../UserFiles/"+ previousUsername, "../UserFiles/"+ newUsername, function(err) {
      if (err) {
        console.error(err)
      } else {
        console.log("Successfully renamed the directory.")
      }
    })
  }
} 

async function changeMail(userID, newMail){
  var error, mailCheck = await db.readDataPromise('user', {email: newMail})
  console.log(mailCheck);
  if(mailCheck.length == 0){
    var error, result = await db.updateDataPromise('user', {id: userID}, {$set: {email: newMail}})
    console.log(result);
  }
}

async function login(username, password) {
  var error, result = await readData("user", { username: username });

  if (error)
    throw error;

  if (result.length > 0) {
    var user = result[0];

    var error, match = await comp_hash(password, user.password);
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

async function register(email, username, password) {
  //prüfen, ob Name und Email vorhanden sind, wen nicht dann hashen und speichern
    try {
      var error, resultUsername = await db.readDataPromise("user", { username: username});
      if(resultUsername.length > 0){
        console.log("Username already taken");
        return false
      }else {
        var error, resultEmail = await readDataPromise("user", {email: email });
        if(resultEmail.length > 0){
          console.log("Mail already taken");
          return false
        }else{
          hash_password(password, (error, hash) => {
            if (error) throw error;
            const id = uuidv4();
            db.createDataPromise('user', {
              id: id,
              username: username,
              password: hash,
              email: email
            });
            createUserHomeDirectory(username);
        })
        return true
      }
    }
    } catch (error) {
      console.log(error);
    }
}

function createUserHomeDirectory(username) {
  //var folderPath = join(__dirname, '../UserFiles', username);
  var folderPath = join(`${__dirname}/../UserFiles/${username}`);

  fs.mkdirSync(folderPath);
}

async function forgotPassword(email) {

  var email = await db.readDataPromise('user', { email: email })
    if (email.length < 1) {
      console.log("Email nicht gefunden");
    } else {
      newPassword = generatePassword();
      hash_password(newPassword, async (error, hash) => {
        if (error) throw error;
        await db.updateDataPromise("user", { email: email }, { $set: { password: hash } })
        sendNewPassword(result[0].email, newPassword, (error, info) => {
          if (error) throw error;
          return true;
        });
      })
    };
  }

function sign(user) {
  const payload = {id: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, config.secret, { expiresIn: '30m' }); //FIXME: expiresIn

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
  verify: verify,
  changeMail: changeMail,
  changeUsername: changeUsername
}
