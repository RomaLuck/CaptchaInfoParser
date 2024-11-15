document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });

        await chrome.scripting.executeScript({
            target: {tabId: tab.id!},
            files: ["dist/data-parser.js"],
        });

        const response: Object = await chrome.tabs.sendMessage(tab.id!, {});

        handleResponse(response);
    } catch (error) {
        console.error("Error: ", error);
    }
});


function handleResponse(response: Object): void {
    if (response) {
        const cardText = document.getElementById('card-text')!;
        const listGroup = document.getElementById('list-group')!;

        const arrayObject = Object.entries(response);
        if (arrayObject.length !== 0) {
            cardText.textContent = 'Captcha was found on this page.';

            const cardImage = document.getElementById('card-img-top')! as HTMLImageElement;
            if (arrayObject[0][0] === 'name' && arrayObject[0][1] === 'Google reCAPTCHA') {
                cardImage.src = 'assets/images/google.png';
            } else if (arrayObject[0][0] === 'name' && arrayObject[0][1] === 'Cloudflare Turnstile CAPTCHA') {
                cardImage.src = 'assets/images/cloudflare.png';
            }

            arrayObject.forEach(([key, value]) => {
                const listElement = document.createElement('li');
                listElement.classList.add('list-group-item');
                listElement.textContent = `${key}: ${value}`;
                listGroup.appendChild(listElement);
            });
        } else {
            cardText.textContent = 'Captcha was not found on this page.';
        }
    } else {
        console.error("Invalid response from content script");
    }
}