import getRandomArbitrary from 'src/utils/getRandomNumber';
import Fetcher from './fetcher';

class Buyer {
    private fetcher;
    private maxCash;
    private maxCoins;

    constructor(fetcher: Fetcher, maxCash: number, maxCoins: number) {
        this.fetcher = fetcher;
        this.maxCash = maxCash;
        this.maxCoins = maxCoins;
    }

    async buyItem(URL: string, priceCash: number, priceCoins: number, token: string | undefined): Promise<void> {
        const buyWithCash = async () => {
            console.log('Trying to buy with cash');
            await this.fetcher.postData(URL + '/buy/1', token);
            console.log('Bought with cash');
        };

        const buyWithCoins = async () => {
            console.log('Trying to buy with coins');
            await this.fetcher.postData(URL + '/buy/2', token);
            console.log('Bought with coins');
        };

        try {
            this.fetcher.applyHeaders();
            const time = getRandomArbitrary(1100, 1900) ?? 1538;

            setTimeout(async () => {
                if (priceCash && priceCash <= this.maxCash) {
                    if (priceCoins && priceCash * 10 <= priceCoins) {
                        await buyWithCash();
                        return;
                    }

                    if (!priceCoins) {
                        await buyWithCash();
                        return;
                    }
                }

                if (priceCoins && priceCoins <= this.maxCoins) {
                    await buyWithCoins();
                    return;
                }
            }, time);
        } catch (err) {
            console.error(`Error occured while performing purchase`);
            throw err;
        }
    }
}

export default Buyer;
