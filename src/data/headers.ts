const headers = new Headers();
headers.append(
    'accept',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
);
headers.append('accept-language', 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7');
headers.append('cache-control', 'max-age=0');
headers.append('priority', 'u=0, i');
headers.append('sec-ch-ua', '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"');
headers.append('sec-ch-ua-arch', '"x86"');
headers.append('sec-ch-ua-bitness', '"64"');
headers.append('sec-ch-ua-full-version', '"126.0.6478.114"');
headers.append(
    'sec-ch-ua-full-version-list',
    '"Not/A)Brand";v="8.0.0.0", "Chromium";v="126.0.6478.114", "Google Chrome";v="126.0.6478.114"'
);
headers.append('sec-ch-ua-mobile', '?0');
headers.append('sec-ch-ua-model', '""');
headers.append('sec-ch-ua-platform', '"Windows"');
headers.append('sec-ch-ua-platform-version', '"10.0.0"');
headers.append('sec-fetch-dest', 'document');
headers.append('sec-fetch-mode', 'navigate');
headers.append('sec-fetch-site', 'same-origin');
headers.append('sec-fetch-user', '?1');
headers.append('upgrade-insecure-requests', '1');
headers.append(
    'user-agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
);
export default headers;
