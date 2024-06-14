import { headers } from 'components/headers';
import Notifier from 'components/notifier';
import newError from 'utils/newError';
import env from 'dotenv';
// const myHeaders = {
//     accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
//     "cache-control": "max-age=0",
//     "content-type": "application/x-www-form-urlencoded",
//     priority: "u=0, i",
//     "sec-ch-ua":
//         '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
//     "sec-ch-ua-arch": '"x86"',
//     "sec-ch-ua-bitness": '"64"',
//     "sec-ch-ua-full-version": '"126.0.6478.56"',
//     "sec-ch-ua-full-version-list":
//         '"Not/A)Brand";v="8.0.0.0", "Chromium";v="126.0.6478.56", "Google Chrome";v="126.0.6478.56"',
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-model": '""',
//     "sec-ch-ua-platform": '"Windows"',
//     "sec-ch-ua-platform-version": '"10.0.0"',
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     cookie: "_ga=GA1.1.1239601327.1718195616; XSRF-TOKEN=eyJpdiI6Ik5OOTg4NU56Sjhra0tja3Uva0UyZEE9PSIsInZhbHVlIjoibVBlMi9vNER3OW82OGlNbkhZaVF0YVhnRkRrSm5BMHFUb21KSHRWSVZnZW1OaTU4STdrTW1iZ3FaSTdyZW9NSWliYzFaTGJvSEtZZ1dWL0xyMG01UnZhZnRHVlU0R2NnaDVwckRlU1JwWmdaMGpyQVRGTUE2TkpDQ1dJalowdGMiLCJtYWMiOiIwMTA5N2E5YTk5ZTU4NGFlM2E1NTEzMGEyOGNkMzg4OTIwOGYxMTBmMjAxMjc5OGY1NjdlNDMzOGJhMWMxODNlIiwidGFnIjoiIn0%3D; cf_clearance=ASIgbFsz9cNQV7HonNUXToydscyu4GxaUyPhrTtbf14-1718370643-1.0.1.1-z08Vw8eyMTedLZ8Zfgt6vAaZMULhUeMbxvMrpJlv5UEvUkkDmUxC._yYhgWkVgbR3rdST0oBHhQHz8UjbDnvlw; BLOXSESS=eyJpdiI6IkxMenIyU1JLWi8wMllNeiszNUZKSGc9PSIsInZhbHVlIjoiU09mYkoyejNZb1hCMWZsdTBPVzR4L29IMHBwZ2F6MzlXcmJ2NlVIVktUOGN1emlhd3ljTS9JdjFlUnh4bys5bUk5ZS9XNDNpVmE4ejhzdW1lZFhkUEFzNjN1c3FFUkU2eVBUZWFhNnNzeE5zaHhOMHdtMmRLZkdYMDRwYXpTMjciLCJtYWMiOiJlNzcxOGFiYjE1ZjQ4MWM2OTc4ZjY2OWRhMTllMzUxYWJhZDM2NTFmZjk4YmYwOTJiN2U4M2VhZDVkOTIyZTViIiwidGFnIjoiIn0%3D; _ga_T2XRWR9F3N=GS1.1.1718368813.11.1.1718370628.0.0.0",
//     Referer: "https://www.bloxcity.com/market/item/749",
//     "Referrer-Policy": "strict-origin-when-cross-origin",
// };
// const urlencoded = new URLSearchParams();
// urlencoded.append("_token", "3CBdqk0EO0tJ1rLHpBtWNNIhWPTTLEjxceUAmeFL");

// const requestOptions: RequestInit = {
//     method: "POST",
//     headers: myHeaders,
//     body: urlencoded,
//     redirect: "follow",
// };

// const link = "https://www.bloxcity.com/market/item/562/buy/2";

// console.log(typeof myHeaders);

// // fetch(link, requestOptions)
// //   .then((response) => response.text())
// //   .then((result) => console.log(result))
// //   .catch((error) => console.error(error));

env.config();

const main = () => {
    const marketURL = process.env.MARKET_URL ?? newError('MarketURL is undefined.');
    const cookie = process.env.COOKIE ?? newError('Cookie is undefined.');
    const notifier = new Notifier(cookie, headers, marketURL);

    notifier.startNotifier(5000);
};

main();
