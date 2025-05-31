document.addEventListener('DOMContentLoaded', function () {
    // Function to create a business card
    function createBusinessCard(business) {
        const cardHtml = `
            <div class="col flip-card">
                <div class="card h-100 sta flip-card-inner">

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
                    </div>
                
                </div>

            </div>
        `;
        return cardHtml;
    }

    // Function to load and display all businesses
    async function loadBusinesses() {
        try {
            const response = await fetch('http://localhost:3000/businesses');
            if (response.ok) {
                const businesses = await response.json();
                const cardContainer = document.querySelector('.row-cols-auto');

                // Clear existing cards
                cardContainer.innerHTML = '';

                // Add each business card
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

    // Load businesses when the page loads
    loadBusinesses();
});
