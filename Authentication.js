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
