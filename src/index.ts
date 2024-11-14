"use strict";

document.getElementById("cloudflare-button")!.addEventListener("click", receiveData('cloudflare'));
document.getElementById("google-button")!.addEventListener("click", receiveData('google'));

function receiveData(actionName: string): () => Promise<void> {
    return async () => {
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true,
            });

            await chrome.scripting.executeScript({
                target: {tabId: tab.id!},
                files: ["dist/data-parser.js"],
            });

            const response: ParserResponseInterface = await chrome.tabs.sendMessage(tab.id!, {
                action: actionName,
            });

            handleResponse(response);
        } catch (error) {
            console.error("Error: ", error);
        }
    };
}

function handleResponse(response: ParserResponseInterface): void {
    if (response) {
        if (response.error) {
            console.error(response.error);
        } else if (response.name === "Google") {
            (document.getElementById("google-action") as HTMLInputElement).value = response.action!;
            (document.getElementById("google-sitekey") as HTMLInputElement).value = response.siteKey!;
        } else if (response.name === "Cloudflare") {
            (document.getElementById("cloudflare-action") as HTMLInputElement).value = response.action!;
            (document.getElementById("cloudflare-sitekey") as HTMLInputElement).value = response.siteKey!;
            (document.getElementById("cloudflare-cdata") as HTMLInputElement).value = response.cData!;
            (document.getElementById("cloudflare-pagedata") as HTMLInputElement).value = response.pageData!;
        }
    } else {
        console.error("Invalid response from content script");
    }
}