import { headers } from 'components/headers';
import Notifier from 'components/notifier';
import newError from 'utils/newError';
import env from 'dotenv';
env.config();

const main = () => {
    const marketURL = process.env.MARKET_URL ?? newError('MarketURL is undefined.');
    const BLOXSESS = process.env.BLOXSESS ?? newError('BLOXSESS is undefined');
    const maxCash = 100;
    const maxCoins = 200;

    const cookie = `BLOXSESS=${BLOXSESS};`;
    const notifier = new Notifier(cookie, headers, marketURL, maxCash, maxCoins);

    setInterval(async () => {
        try {
            notifier.startNotifier();
        } catch (err) {
            console.error(err);
        }
    }, 5000);
};

main();
