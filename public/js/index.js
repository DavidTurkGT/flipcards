console.log("Hello there!");

let msgContainer = document.querySelector(".messages");

function login() {
  let usernameInput = document.querySelector("input[name='username_login']");
  let username = usernameInput.value;
  let passwordInput = document.querySelector("input[name='password_login']");
  let password = passwordInput.value;

  fetch('/users/login',{
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password
    }),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  })
  .then( (res) => {
    if(res.status === 500){
      removeChildren(msgContainer);
      let p = document.createElement("p");
      p.textContent = "Internal server error. Please try again later";
      msgContainer.appendChild(p);
    }
    else if(res.status === 401){
      removeChildren(msgContainer);
      let p = document.createElement("p");
      p.textContent = "Invalid username/password";
      msgContainer.appendChild(p);
    }
    else{
      window.location.replace("/home");
    }
  })
};

function signup() {
  let usernameInput = document.querySelector("input[name='username_sign_up']");
  let username = usernameInput.value;
  usernameInput.value = "";
  let passwordInput = document.querySelector("input[name='password_sign_up']");
  let password = passwordInput.value;
  passwordInput = "";
  let confirmInput = document.querySelector("input[name='confirm_password']");
  let confirmPassword = confirmInput.value;
  confirmInput = "";
  if( verifySignup(username, password, confirmPassword) ){
    let payload = {
      username: username,
      password: password
    };
    fetch('/users',{
      method: "POST",
      body: JSON.stringify(payload),
      headers: new Headers({ 'Content-Type': 'application/json' })
    })
    .catch( (err) => console.log("ERROR!: ", err) )
    .then( (res) => {
      if( res.status !== 200){
        removeChildren(msgContainer);
        res.json().then( (data) => {
          data.errors.forEach( (err) => {
            let p = document.createElement("p");
            p.textContent = err;
            msgContainer.appendChild(p);
          });
        });
      }
      else{
        removeChildren(msgContainer);
        res.json().then( (data) => {
          let p = document .createElement("p");
          p.textContent = "Created new user: " +  data.newUser.username;
          msgContainer.appendChild(p);
        })
      }
    })
  }
  else{
    console.log("You may not log in");
  }
};

function verifyLogin(username, password) {
  let errorContainer = document.querySelector(".messages");
  errorContainer = removeChildren(errorContainer);

};

function verifySignup(user, password, confirmPassword) {
  let errorContainer = document.querySelector(".messages");
  errorContainer = removeChildren(errorContainer);
  let verified = true, msg;
  if(user === ""){
    verified = false;
    msg = document.createElement('p');
    msg.textContent = "Please enter a username to sign up";
    errorContainer.appendChild(msg);
  }
  if(password === ""){
    verified = false;
    msg = document.createElement('p');
    msg.textContent = "Please enter a password to sign up";
    errorContainer.appendChild(msg);
  }
  if(confirmPassword !== password){
    verified = false;
    msg = document.createElement('p');
    msg.textContent = "Password and confirmation do not match";
    errorContainer.appendChild(msg);
  }
  return verified;
};

function removeChildren(element) {
  //Remove all previous messages
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
  return element;
}
