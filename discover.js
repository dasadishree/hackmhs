document.addEventListener('DOMContentLoaded', function () {
    let currentUser = null;

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }

    function createBusinessCard(business) {
        const userStamps = currentUser ? currentUser.stamps[business.id] || 0 : 0;
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
                            </div>
                            <div class="card-footer">
                                <small class="text-muted">${business.stamps} stamps on a card</small>
                                <br>
                                <small class="text-muted">Reward: ${business.reward}</small>
                            </div>
                        </div>

                        <div class="flip-card-back">
                            <h5>STAMPS</h5>
                            <br>
                            <img class="card-image" src="./stamp-images/${userStamps}-stamps.png">
                            ${currentUser ? `
                                <center>
                                    <button type="button" class="btn stamp-it" 
                                        onclick="addStamp('${business.id}')" 
                                        ${userStamps >= business.stamps ? 'disabled' : ''}>
                                        stamp it!
                                    </button>
                                </center>
                            ` : `
                                <center>
                                    <p>Please log in to collect stamps</p>
                                </center>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        return cardHtml;
    }

    async function loadBusinesses() {
        try {
            const response = await fetch('http://localhost:3000/businesses');
            if (response.ok) {
                const businesses = await response.json();
                const cardContainer = document.querySelector('.row');

                cardContainer.innerHTML = '';

                businesses.forEach(business => {
                    cardContainer.innerHTML += createBusinessCard(business);
                });
            } else {
                console.error('Failed to fetch businesses');
            }
        } catch (error) {
            console.error('Error loading businesses:', error);
        }
    }

    // Add stamp function
    window.addStamp = async function(businessId) {
        if (!currentUser) return;

        try {
            const userStamps = currentUser.stamps[businessId] || 0;
            const response = await fetch('http://localhost:3000/update-stamps', {
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
    window.login = async function(email, password) {
        try {
            const response = await fetch('http://localhost:3000/login', {
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
    window.register = async function(email, password) {
        try {
            const response = await fetch('http://localhost:3000/register', {
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
    window.logout = function() {
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
});
