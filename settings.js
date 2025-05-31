document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('settingsForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData();

        formData.append('businessName', document.getElementById('businessName').value);
        formData.append('businessType', document.getElementById('businessType').value);
        formData.append('stamps', document.getElementById('stamps').value);
        formData.append('topselling1', document.getElementById('topselling1').value);
        formData.append('topselling2', document.getElementById('topselling2').value);
        formData.append('topselling3', document.getElementById('topselling3').value);

        const logoFile = document.getElementById('logoImage').files[0];
        if (logoFile) {
            formData.append('logoImage', logoFile);
        }

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                alert('Upload successful! File saved as: ' + data.imageUrl);
                // Optionally reset form here:
                // document.getElementById('settingsForm').reset();
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading file');
        }
    });
});
