'use strict';
module.exports = function(sequelize, DataTypes) {
  var Deck = sequelize.define('Deck', {
    name: DataTypes.STRING,
    userID: DataTypes.INTEGER
  }, {});

  Deck.associates = (models) => {
    Deck.belongsTo(
      models.User,
      {as: "user", foreignkey: "userID"}
    );
    Deck.hasMany(
      models.Flipcard,
      {as: "cards", foreignkey: "deckID"}
    );
  }

  return Deck;
};
