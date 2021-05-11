const bcrypt = require('bcrypt');

exports.hash_password = function (password, callback) {
        bcrypt.hash(password, 10, function(error, hash) {
            if (error) {
              throw error;
            }
            console.log('Your hash: ', hash);
            callback(error, hash);
          });

};


exports.compare_hash= function (password, hashFromDB, callback) {
    bcrypt.compare(password, hashFromDB, function(error, matches) {
        if (error)
          console.log('Error while checking password');
        else if (matches)
          console.log('The password matches!');
        else
          console.log('The password does NOT match!');
      });
      callback(error, machtes);
};
