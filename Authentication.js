const bcrypt = require('bcrypt');
var password = "";
var hashFromDB = "";

function hash_password(password) {
    if (password.length >= 6) {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
              throw err;
            }
            hashFromDB = hash;
            console.log('Your hash: ', hash);
          });
    }else {
        console.log('Password is to weak');
    };
};

function compare_hash(password, hashFromDB) {
    bcrypt.compare(password, hashFromDB, function(err, matches) {
        if (err)
          console.log('Error while checking password');
        else if (matches)
          console.log('The password matches!');
        else
          console.log('The password does NOT match!');
      });
};

// in app.js kopieren
//Verarbeitet die empfangenen Daten beim Login
app.post('/login', (req, res) => {
  //res.send(`Full name is:${req.body.username} ${req.body.password}.`);
  console.log(`${req.body.username} ${req.body.password}`);
});

//Verarbeitet die empfangenen Daten beim Registrieren
app.post('/register', (req, res) => {

  console.log(`${req.body.username} ${req.body.password} ${req.body.confirm_password} ${req.body.mail}`);
  // Passwort 1 und 2 überprüfen usw. Dann Passwort hashen und die Daten in die DB schreiben
});

// In den port zwischen erstllung und listen kopieren
app.use(parser.urlencoded({ extended: false })); 

//in den Kopf kopieren
const parser = require("body-parser");