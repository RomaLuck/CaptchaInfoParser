import MessageSender = chrome.runtime.MessageSender;

chrome.runtime.onMessage.addListener((
    message: any,
    sender: MessageSender,
    sendResponse: (response: ParserResponseInterface) => void
): void => {
    if (message.action === "google") {
        sendResponse(parseGoogleCaptcha());
    } else if (message.action === "cloudflare") {
        sendResponse(parseCloudflareCaptcha());
    } else {
        throw new Error("Invalid action");
    }
});

function parseGoogleCaptcha(): ParserResponseInterface {
    const captchaInfo = getCaptchaInfo('recaptcha');
    if (!captchaInfo) {
        throw new Error("Google captcha not found");
    }

    const siteKey = captchaInfo.match(/(6L[\w_]{38})/iu)?.[1] ?? '';
    const action = captchaInfo.match(/action[":\s]+"(.+?)"/iu)?.[1] ?? '';

    return {
        name: "Google",
        siteKey: siteKey,
        action: action
    };
}

function parseCloudflareCaptcha(): ParserResponseInterface {
    const captchaInfo = getCaptchaInfo('chlApiSitekey');
    if (!captchaInfo) {
        throw new Error("Cloudflare captcha not found");
    }

    const action = captchaInfo.match(/chlApiMode:\s*"(.+?)"/iu)?.[1] ?? '';
    const siteKey = captchaInfo.match(/chlApiSitekey:\s*"(.+?)"/iu)?.[1] ?? '';
    const cData = captchaInfo.match(/cRay:\s*"(.+?)"/iu)?.[1] ?? '';
    const pageData = captchaInfo.match(/cH:\s*"(.+?)"/iu)?.[1] ?? '';

    return {
        name: "Cloudflare",
        siteKey: siteKey,
        cData: cData,
        pageData: pageData,
        action: action,
    };
}

function getCaptchaInfo(selector: string): string | null | undefined {
    return Array.from(document.scripts)
        .find(script => script.textContent?.includes(selector))
        ?.textContent;
}
