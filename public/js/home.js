console.log("Hello there!");

let deckContainer = document.querySelector(".deck-container");
let cardContainer = document.querySelector(".card-container");
let quizContainer = document.querySelector(".quizzes");

let decks;

fetch("/deck").then( (res) => {
  if(res != 200){

  }
  else{
    res.json().then( (data) => {
      //Create all the deck HTML blocks
    })
  }
})
