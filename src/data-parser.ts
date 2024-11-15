import MessageSender = chrome.runtime.MessageSender;

chrome.runtime.onMessage.addListener((
    message: any,
    sender: MessageSender,
    sendResponse: (response: Object) => void
): void => {
    const googleCaptcha = parseGoogleCaptcha();
    const cloudflareCaptcha = parseCloudflareCaptcha();

    if (googleCaptcha) {
        sendResponse(googleCaptcha);
    } else if (cloudflareCaptcha) {
        sendResponse(cloudflareCaptcha);
    } else {
        sendResponse({});
    }
});

function parseGoogleCaptcha(): Object | null {
    const captchaInfo = getCaptchaInfo('recaptcha');
    if (!captchaInfo) {
        return null;
    }

    const siteKey = captchaInfo.match(/['"](6L[\w_]{38})['"]/iu)?.[1] ?? '';
    const action = captchaInfo.match(/action[":\s]+"(.+?)"/iu)?.[1] ?? '';
    const isEnterprise = document.querySelector('[src*="google.com/recaptcha/enterprise"]') !== null;

    return {
        name: "Google reCAPTCHA",
        siteKey: siteKey,
        action: action,
        enterprise: isEnterprise,
    };
}

function parseCloudflareCaptcha(): Object | null {
    const captchaInfo = getCaptchaInfo('window._cf_chl_opt');
    if (!captchaInfo) {
        return null;
    }

    const action = captchaInfo.match(/cType:\s*['"](.+?)['"]/iu)?.[1] ?? '';
    const cData = captchaInfo.match(/cRay:\s*['"](.+?)['"]/iu)?.[1] ?? '';
    const pageData = captchaInfo.match(/cH:\s*['"](.+?)['"]/iu)?.[1] ?? '';
    const siteKey = document.body.innerHTML.match(/['"](0x\w{22})['"]/iu)?.[1] ?? '';

    return {
        name: "Cloudflare Turnstile CAPTCHA",
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
