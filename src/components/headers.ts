const init: HeadersInit = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'max-age=0',
    'content-type': 'application/x-www-form-urlencoded',
    priority: 'u=0, i',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-full-version': '"126.0.6478.56"',
    'sec-ch-ua-full-version-list':
        '"Not/A)Brand";v="8.0.0.0", "Chromium";v="126.0.6478.56", "Google Chrome";v="126.0.6478.56"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // cookie: `${cookie}`,
    // Referer: "https://www.bloxcity.com/market/item/749",
};

const headers = new Headers(init);

// const urlencoded = new URLSearchParams();
// urlencoded.append("_token", "3CBdqk0EO0tJ1rLHpBtWNNIhWPTTLEjxceUAmeFL");

export { headers };
