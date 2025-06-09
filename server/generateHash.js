const bcrypt = require('bcrypt');

bcrypt.hash("20997345", 10, (err, hash) => {
  if (err) throw err;
  console.log("Le hash est :", hash);
});
