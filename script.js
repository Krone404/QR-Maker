function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        console.log("get current url");
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
                return;
            }
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;
            resolve(currentUrl);
        });
    });
}

function createQrCode(data) {
    fetch(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data}`)
        .then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);

            // Remove the old QR code image if it exists
            const oldQrCode = document.getElementById("qr-code");
            if (oldQrCode) {
                oldQrCode.remove();
            }

            // Remove the old download link if it exists
            const oldDownloadLink = document.getElementById("qr-code-link");
            if (oldDownloadLink) {
                oldDownloadLink.remove();
            }

            // Create and display the new QR code image
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "QR Code";
            img.id = "qr-code";
            document.querySelector(".qr-code-img").appendChild(img);

            // Create a new download link for the QR code image
            const downloadLink = document.createElement("a");
            downloadLink.id = "qr-code-link";
            downloadLink.href = imageUrl;

            // Check if the data is a valid URL, if not, just use a default name
            let imageName;
            try {
                imageName = new URL(data).hostname.split('.')[0]; // Extract the hostname
            } catch (e) {
                imageName = 'qr-code'; // Fallback if it's not a valid URL
            }

            downloadLink.download = `${imageName}.png`; // Set download filename
            downloadLink.textContent = "Download QR Code";
            document.querySelector(".qr-code-img").appendChild(downloadLink);
        })
        .catch(error => {
            console.error('Error fetching the QR code:', error);
        });
}

document.getElementById('qr-input-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const inputValue = document.getElementById('qr-input').value; // Get input value
    if (inputValue) {
        createQrCode(inputValue); // Create or update the QR code with the input value
    } else {
        getCurrentTabUrl().then(createQrCode).catch(console.error);
    }
    });

// Initialize the page with the current tab's URL as the QR code (on page load)
getCurrentTabUrl().then(createQrCode).catch(console.error);
