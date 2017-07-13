'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      "Flipcards",
      "deckId",
      {
        type: Sequelize.INTEGER,
        default: 1
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn(
      "Flipcards",
      "deckId"
    )
  }
};
