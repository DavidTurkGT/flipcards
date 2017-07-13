'use strict';
module.exports = function(sequelize, DataTypes) {
  var Flipcard = sequelize.define('Flipcard', {
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    deckID: DataTypes.INTEGER
  }, {});

  Flipcard.associate = (model) => {
    Flipcard.belongsTo(
      model.Deck,
      {as: "deck", foreignkey: "deckID" }
    );
  }

  return Flipcard;
};
