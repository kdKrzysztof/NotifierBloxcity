import Notifier from 'components/notifier';
import newError from 'utils/newError';
import env from 'dotenv';
import headers from './data/headers';
env.config();

const main = () => {
    const marketURL = process.env.MARKET_URL ?? newError('MarketURL is undefined.');
    const BLOXSESS = process.env.BLOXSESS ?? newError('BLOXSESS is undefined');
    const cf_clearance = process.env.CF_CLEARANCE ?? newError('cf_clearance is undefined');
    const maxCash = 100;
    const maxCoins = 200;
    const time = 8000;
    const cookieCheckTimeMinutes = 30; //minutes;
    const cookieCheckTime = cookieCheckTimeMinutes * 60 * 1000;
    const iterationNumberLimit = cookieCheckTime / time;

    const cookie = `BLOXSESS=${BLOXSESS}; cf_clearance=${cf_clearance}`;
    const cookieCfClearance = `cf_clearance=${cf_clearance}`;
    const notifier = new Notifier(
        cookie,
        headers,
        marketURL,
        maxCash,
        maxCoins,
        iterationNumberLimit,
        cookieCfClearance
    );

    (async () => {
        await notifier.checkCookieStatus();
    })();

    setInterval(async () => {
        try {
            notifier.startNotifier();
        } catch (err) {
            console.error(err);
        }
    }, time);
};

main();
