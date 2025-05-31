document.getElementById('settingsForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('businessName').value;
    const businessType = document.getElementById('businessType').value;
    const stampsPerCard = document.getElementById('stamps').value;
    // const topGoods = [document.getElementById('topselling1'), document.getElementById('topselling2'), document.getElementById('topselling3')];
    // alert(topGoods);

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