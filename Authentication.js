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
    bcrypt.compare(password, hashFromDB, function(error, match) {
      if(error) {
        throw error;
      }else{
        callback(error, match);
      }
    });
};




