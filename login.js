const emails = ["dasadishree@gmail.com", "emmawong565@gmail.com"];
const passwords = ["123abc", "Baddies65"];

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;

    let loginSuccessful = false;

    for (let i = 0; i < emails.length; i++) {
        if (email === emails[i] && password === passwords[i]) {
            window.location.href = "landing.html";
            loginSuccessful=true;
            break;
        } 
    }

    if(!loginSuccessful){
        alert("Invalid email or password.");
    }
});