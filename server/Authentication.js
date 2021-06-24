const bcrypt = require('bcrypt');
const generator = require('generate-password');
const jwt = require('jsonwebtoken');

const nodemailer = require("nodemailer");
const db = require("./Database");
const config = require('./config.json');
const util = require('util');
const uuidv4 = require('uuid').v4;
const fs = require("fs");
const { join } = require('path');

const readData = util.promisify(db.readData);
const comp_hash = util.promisify(compare_hash);

/**
 * Password will be hased
 * @param {*} password 
 * @param {*} callback hashed password.
 */
function hash_password(password, callback) {
  bcrypt.hash(password, 10, function (error, hash) {
    if (error) {
      throw error;
    }
    callback(error, hash);
  });
}

/**
 * Compares a password with a hash from a database
 * @param {*} password 
 * @param {*} hashFromDB 
 * @param {*} callback true if hashes are machting. false if not
 */
function compare_hash(password, hashFromDB, callback) {
  bcrypt.compare(password, hashFromDB, function (error, match) {
    if (error) {
      throw error;
    } else {
      callback(error, match);
    }
  });
}

/**
 * Sends the new generated password to the reciever(email).
 * @param {*} receiver Email reciever
 * @param {*} newPassword New generated password
 * @param {*} callback Information wether it's send or not
 */
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
      console.error(error.stack);
      throw error;
    } else {
      console.log('Email sent: ' + info.response);
      callback(error, info);
    }
  });
}

/**
 * Creates a random six-digit String.
 * @returns String with the six-digit generated password
 */
function generatePassword() {
  var newPW = generator.generate({ length: 6, numbers: true })
  return newPW;
}

/**
 * Checks if the new username is stored on the database. if not the previous username will be updated to the new username.
 * Also the users folder will be renamed with the new username.
 * @param {*} userID The users uuid.
 * @param {*} newUsername 
 * @param {*} previousUsername 
 * @returns True if the username was updated in the databse. False if the username was taken.
 */
async function changeUsername(userID, newUsername, previousUsername) {
  var error, usernameCheck = await db.readDataPromise('user', { username: newUsername })
  if (usernameCheck.length == 0) {
    var error, result = await db.updateDataPromise('user', { id: userID }, { $set: { username: newUsername } })

    fs.rename("../UserFiles/" + previousUsername, "../UserFiles/" + newUsername, function (err) {
      if (err) {
        console.error(error.stack)
      } else {
        console.log(`Renamed ${previousUsername} to ${newUsername}`);
      }
    })
    return true;
  }
  return false;
}

/**
 * Checks if the new email is stored on the database. if not the previous stored email will be updated to the new email.
 * @param {*} userID The users uuid.
 * @param {*} newMail
 * @returns True if the email was updated in the databse. False if the email was taken.
 */
async function changeMail(userID, newMail) {
  var error, mailCheck = await db.readDataPromise('user', { email: newMail })

  if (mailCheck.length == 0) {
    await db.updateDataPromise('user', { id: userID }, { $set: { email: newMail } });
    return true;
  }
  return false;
}

/**
 * Checks if the username and the password matches with the information from the database.
 * @param {*} username 
 * @param {*} password 
 * @returns The user information
 */
async function login(username, password) {
  var error, result = await readData("user", { username: username });

  if (error)
    throw error;

  if (result.length > 0) {
    var user = result[0];

    var error, match = await comp_hash(password, user.password);

    if (error) throw error;

    if (match) return user;
  }
}

/**
 * Create a user and store the information in the database. Also creates a folder with the user name.
 * @param {*} email 
 * @param {*} username 
 * @param {*} password 
 * @returns False if the username is taken. Falseif the email is taken. True if none of the is taken and a folder with the users name is created.
 */
async function register(email, username, password) {
  try {
    var error, resultUsername = await db.readDataPromise("user", { username: username });
    if (resultUsername.length > 0) {
      console.log("Username already taken");
      return false;
    } else {
      var error, resultEmail = await db.readDataPromise("user", { email: email });
      if (resultEmail.length > 0) {
        console.log("Mail already taken");
        return false
      } else {
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
    console.error(error.stack);
  }
}

/**
 * Create a folder with the username.
 * @param {*} username 
 */
function createUserHomeDirectory(username) {
  var folderPath = join(`${__dirname}/../UserFiles/${username}`);
  fs.mkdirSync(folderPath);
}

/**
 * Sends a random six-digit password the the entered email if the email i stored in the database.
 * Also the new password will be hashed and updated in the database.
 * @param {*} email 
 */
async function forgotPassword(email) {

  var emailCheck = await db.readDataPromise('user', { email: email })
  if (emailCheck.length < 1) {
    console.log("Email nicht gefunden");
  } else {
    var newPassword = generatePassword();
    hash_password(newPassword, async (error, hash) => {
      if (error) throw error;
      await db.updateDataPromise("user", { email: email }, { $set: { password: hash } })
      sendNewPassword(email, newPassword, (error, info) => {
        if (error) throw error;
        return true;
      });
    })
  }
}

/**
 * Creates a token in terms of the users id, username and email.
 * @param {*} user 
 * @returns Generated token.
 */
function sign(user) {
  const payload = { id: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, config.secret); //TODO: expiresIn (implement 30min login timeout)

  return token;
}

/**
 * Verifies a token.
 * @param {*} token 
 * @returns Token information.
 */
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
