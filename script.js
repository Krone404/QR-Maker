function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
                return;
            }
            var currentTab = tabs[0];
            var currentUrl = currentTab.url;

            resolve(currentUrl); // Resolve the promise with the current URL
        });
    });
}

function createQrCode(currentUrl) {
    fetch(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUrl}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Return the blob of the image (binary data)
            return response.blob();
        })
        .then(blob => {
            // Create a local URL for the blob (image data)
            const imageUrl = URL.createObjectURL(blob);

            // Create an img element to display the QR code
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = "QR Code";
            document.getElementsByClassName("qr-test")[0].appendChild(img);

            // Extract the hostname and remove the TLD
            const imageName = (new URL(currentUrl)).hostname.split('.')[0]; // This will get "goqr"

            // Create a download link
            const downloadLink = document.createElement("a");
            downloadLink.href = imageUrl;
            downloadLink.download = `${imageName}.png`; // Set the custom file name
            downloadLink.innerText = "Download QR Code";

            // Append the download link to the div
            document.getElementsByClassName("qr-test")[0].appendChild(downloadLink);
        })
        .catch(error => {
            console.error('Error fetching the QR code:', error);
        });
}

// Call getCurrentTabUrl and then create the QR code
getCurrentTabUrl()
    .then(currentUrl => {
        console.log("Current URL:", currentUrl);
        createQrCode(currentUrl);
    })
    .catch(error => {
        console.error("Error getting current tab URL:", error);
    });
