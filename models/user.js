'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    passwordSalt: DataTypes.TEXT,
    passwordIterations: DataTypes.TEXT,
    passwordHash: DataTypes.TEXT
  }, {});

  User.associates = (models) => {
    User.hasMany(
      models.Deck,
      {as: "decks", foreignkey: "userID"}
    );
  }

  return User;
};
