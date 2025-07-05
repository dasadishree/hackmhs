let stamps = 0;
let businessStamps = {};
let userState = ''; // Add variable to store state

const SERVER_URL = 'https://stampd-backend-3azx.onrender.com/'; 

// Load saved stamps from localStorage when the script starts
function loadSavedStamps() {
    const savedStamps = localStorage.getItem('businessStamps');
    if (savedStamps) {
        businessStamps = JSON.parse(savedStamps);
    } else {
        businessStamps = {};
    }
}

function claim(businessName) {
    // Reset stamps for this business
    if (businessStamps[businessName]) {
        businessStamps[businessName] = 0;
        localStorage.setItem('businessStamps', JSON.stringify(businessStamps));
    }
    window.location.href = 'claim.html';
}

function incrementStamp(businessName, maxStamps) {
    if (!businessStamps[businessName]) {
        businessStamps[businessName] = 0;
    }
    
    if (businessStamps[businessName] < maxStamps) {
        businessStamps[businessName]++;
        const safeName = businessName.replace(/[^a-zA-Z0-9]/g, '-');
        const cardImage = document.querySelector(`#stampCode-${safeName}`).closest('.flip-card-back').querySelector('.card-image');
        cardImage.src = `./stamp-images/${businessStamps[businessName]}-stamps.png`;
        
        // Show claim button if stamps are complete
        if (businessStamps[businessName] >= maxStamps) {
            const claimButton = document.querySelector(`#stampCode-${safeName}`).closest('.flip-card-back').querySelector('.claim-button');
            if (claimButton) {
                claimButton.style.display = 'inline-block';
            }
        }
        
        // Save to localStorage after incrementing
        localStorage.setItem('businessStamps', JSON.stringify(businessStamps));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    let currentUser = null;
    const confirmationCode = "thisisthecode";

    // Load saved stamps when the page loads
    loadSavedStamps();

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }

    function createBusinessCard(business) {
        const userStamps = currentUser ? currentUser.stamps[business.id] || 0 : 0;
        const safeBusinessName = business.businessName.replace(/[^a-zA-Z0-9]/g, '-');
        const escapedBusinessName = business.businessName.replace(/'/g, "\\'");
        const currentStamps = businessStamps[business.businessName] || 0;
        const showClaimButton = currentStamps >= business.stamps;
        
        const cardHtml = `
            <div class="col-auto p-1">
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <img src="${business.logoImage || './images/default-business.png'}" class="card-img-top" alt="Business Image">
                            <div class="card-body">
                                <h5 align="center" class="card-title">${business.businessName}</h5>
                                <strong><h6 class="card-type">${business.businessType}</h6></strong>
                                <p class="card-text"><strong>Best-sellers:</strong> ${business.topselling1}, ${business.topselling2}, ${business.topselling3}</p>
                                <p class="card-text">Location: ${business.state}</p> 
                                </div>
                            <div class="card-footer">
                                <small class="text-muted">${business.stamps} stamps on a card</small>
                                <br>
                                <small class="text-muted">Reward: ${business.reward}</small>
                                <br>
                                <small class="text-muted">Minimum Purchase: ${business.minpurchase}</small>

                                </div>
                        </div>

                        <div class="flip-card-back">
                            <h5>STAMPS</h5>
                            <br>
                            <img class="card-image" src="./stamp-images/${currentStamps}-stamps.png">
                            <center>
                                <div class="form-group">
                                    <label for="stampCode-${safeBusinessName}" class="my-1 mt-4"><strong>password</strong></label>
                                    <input type="password" class="form-control" id="stampCode-${safeBusinessName}" placeholder="Password" />
                                </div>
                                <button type="button" class="btn" style="margin-top: 5px; background-color: #ef8172; border: 1cm;" 
                                    onclick="if(document.getElementById('stampCode-${safeBusinessName}').value === '${confirmationCode}') {
                                        console.log('Code matches!'); 
                                        incrementStamp('${escapedBusinessName}', ${business.stamps});
                                        console.log('Stamps for ${escapedBusinessName}:', businessStamps['${escapedBusinessName}']);
                                    } 
                                    else { 
                                        console.log('Code does not match!'); 
                                    }">stamp it!</button>

                                <button type="button" class="btn claim-button" style="margin-top: 5px; background-color: rgb(255, 0, 157); border: 1cm; display: ${showClaimButton ? 'inline-block' : 'none'};" 
                                    onclick="claim('${escapedBusinessName}')">CLAIM!!!</button>
                            </center>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return cardHtml;
    }

    async function loadBusinesses() {
        try {
            const response = await fetch(`${SERVER_URL}/businesses`);
            if (response.ok) {
                const businesses = await response.json();
                const cardContainer = document.querySelector('.row');

                cardContainer.innerHTML = '';

                // Filter businesses if userState is set
                const filteredBusinesses = userState ? 
                    businesses.filter(business => business.state === userState) : 
                    businesses;

                filteredBusinesses.forEach(business => {
                    cardContainer.innerHTML += createBusinessCard(business);
                });

                // Show message if no businesses found in state
                if (userState && filteredBusinesses.length === 0) {
                    cardContainer.innerHTML = `<div class="col-12 text-center">
                        <h3>No businesses found in ${userState}</h3>
                    </div>`;
                }
            } else {
                console.error('Failed to fetch businesses');
            }
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    }

    // Add stamp function
    window.addStamp = async function (businessId) {
        if (!currentUser) return;

        try {
            const userStamps = currentUser.stamps[businessId] || 0;
            const response = await fetch(`${SERVER_URL}/update-stamps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: currentUser.email,
                    businessId: businessId,
                    stamps: userStamps + 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                currentUser.stamps = data.stamps;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                loadBusinesses(); // Reload to update UI
            }
        } catch (error) {
            console.error('Error adding stamp:', error);
        }
    };

    // Login function
    window.login = async function (email, password) {
        try {
            const response = await fetch(`${SERVER_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUIForLoggedInUser();
                loadBusinesses(); // Reload to update UI
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error logging in:', error);
            return false;
        }
    };

    // Register function
    window.register = async function (email, password) {
        try {
            const response = await fetch(`${SERVER_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error registering:', error);
            return false;
        }
    };

    // Logout function
    window.logout = function () {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUIForLoggedInUser();
        loadBusinesses(); // Reload to update UI
    };

    function updateUIForLoggedInUser() {
        // Add login/logout buttons to the header
        const header = document.querySelector('.nav');
        const authButton = document.querySelector('.auth-button');

        if (currentUser) {
            if (!authButton) {
                const logoutButton = document.createElement('li');
                logoutButton.className = 'nav-item';
                logoutButton.innerHTML = `
                    <button class="nav-link hi" style="color: white; background: none; border: none;" onclick="logout()">
                        logout
                    </button>
                `;
                header.appendChild(logoutButton);
            }
        } else {
            if (authButton) {
                authButton.remove();
            }
        }
    }


    loadBusinesses();

    //Location:
    function findMyState() {
        console.log('Starting location request...');

        if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
        }

        const success = (position) => {
            console.log('Got position:', position);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log('Coordinates:', { latitude, longitude });

            const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            console.log('Fetching from:', geoApiUrl);

            fetch(geoApiUrl)
            .then(res => {
                console.log('API Response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Location data:', data);
                if (data.principalSubdivision) {
                    userState = data.principalSubdivision;
                    console.log(userState);
                    // Reload businesses after getting state
                    loadBusinesses();
                } else {
                    console.error('Could not determine state');
                }
            })
            .catch(error => {
                console.error('Error fetching location:', error);
            });
        };

        const error = (error) => {
            console.error('Geolocation error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        try {
            console.log('Requesting geolocation...');
            navigator.geolocation.getCurrentPosition(success, error, options);
        } catch (e) {
            console.error('Error in geolocation request:', e);
        }
    
        
    }

    // Add click handler with error catching
    try {
        const locationButton = document.querySelector(".find-loc");
        if (locationButton) {
            locationButton.addEventListener("click", (e) => {
                e.preventDefault();
                console.log('Location button clicked');
                findMyState();
            });
        } else {
            console.error('Location button not found');
        }
    } catch (e) {
        console.error('Error setting up location button:', e);
    }
});
