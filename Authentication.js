const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const generator = require('generate-password');

//Hasht das Passwort
exports.hash_password = function (password, callback) {
        bcrypt.hash(password, 10, function(error, hash) {
            if (error) {
              throw error;
            }
            console.log('Your hash: ', hash);
            callback(error, hash);
         });
};

//Vergleicht zwei hashes
exports.compare_hash= function (password, hashFromDB, callback) {
    bcrypt.compare(password, hashFromDB, function(error, match) {
      if(error) {
        throw error;
      }else{
        callback(error, match);
      }
    });
};

//Passwort vergessen funktion
exports.sendNewPassword = function(receiver, newPassword, callback) {

  const transporter = nodemailer.createTransport({service: 'gmail',auth: {user: 'cloudneinofficial@gmail.com', pass: 'CloudNein'},});
  var mailOptions = {from: 'cloudneinofficial@gmail.com', to: receiver, subject: 'Your CloudNein Password',text: "Your new password: " + newPassword};

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      throw error;
    }else {
      console.log('Email sent: ' + info.response);
      callback(error, info);
    };
  }); 
};





exports.generatePassword = function() {
  var newPW = generator.generate({length: 6, numbers: true})
      console.log('Generated Password: ' + newPW);
  return newPW
};




