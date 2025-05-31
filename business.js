document.addEventListener('DOMContentLoaded', function () {
    // Server configuration
    const SERVER_URL = 'http://localhost:3000'; // Local development server

    document.getElementById('settingsForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate required fields
        const businessName = document.getElementById('businessName').value;
        const businessType = document.getElementById('businessType').value;
        const stamps = document.getElementById('stamps').value;
        const topselling1 = document.getElementById('topselling1').value;
        const topselling2 = document.getElementById('topselling2').value;
        const topselling3 = document.getElementById('topselling3').value;
        const reward = document.getElementById('reward').value;
        const minpurchase = document.getElementById('min-purchase').value;
        
        if (!businessName || businessType === '--' || stamps === '--' || !topselling1 || !topselling2 || !topselling3 || !reward) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData();

        formData.append('businessName', businessName);
        formData.append('businessType', businessType);
        formData.append('stamps', stamps);
        formData.append('topselling1', topselling1);
        formData.append('topselling2', topselling2);
        formData.append('topselling3', topselling3);
        formData.append('reward', reward);
        formData.append('state', state);
        formData.append('minpurchase', minpurchase);
        const logoFile = document.getElementById('logoImage').files[0];
        if (logoFile) {
            formData.append('logoImage', logoFile);
        }

        try {
            console.log('Attempting to connect to server...');
            const response = await fetch(`${SERVER_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            console.log('Server response received:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                alert('Business added successfully!');
                // Reset form
                document.getElementById('settingsForm').reset();
                // Redirect to discover page
                window.location.href = 'discover.html';
            } else {
                alert('Failed to add business: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Detailed error:', error);
            if (error.message === 'Failed to fetch') {
                alert(`Could not connect to the server. Please make sure the server is running at ${SERVER_URL}`);
            } else {
                alert('Error adding business: ' + error.message);
            }
        }
    });
});
