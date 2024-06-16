import parse from 'node-html-parser';
import newError from 'src/utils/newError';
import getRandomArbitrary from 'src/utils/getRandomNumber';

class Notifier {
    private latestItemURL: string = '';
    private itemName: string | undefined = '';
    private itemPriceCash: number | undefined = undefined;
    private itemPriceCoins: number | undefined = undefined;
    private ItemURL: string | undefined = '';
    private Collectible: boolean = false;
    private token: string | undefined = '';
    private readonly marketURL: string = '';
    private readonly headers: Headers;
    private readonly cookie: string = '';
    private readonly maxCash: number = 0;
    private readonly maxCoins: number = 0;

    constructor(iCookie: string, iHeaders: Headers, MarketURL: string, iMaxCash: number, iMaxCoins: number) {
        this.cookie = iCookie;
        this.headers = iHeaders;
        this.marketURL = MarketURL;
        this.maxCash = iMaxCash;
        this.maxCoins = iMaxCoins;
        this.headers.append('cookie', this.cookie);
    }

    private async fetchData(URL: string) {
        try {
            const resp = await fetch(URL, {
                method: 'GET',
                headers: this.headers,
                redirect: 'follow',
            });

            if (!resp.ok) {
                throw new Error(`HTTP error! Status: ${resp.status}`);
            }

            const data = await resp.text();
            return data;
        } catch (err) {
            console.error('Error occured while fetching data.');
            throw err;
        }
    }

    private applyHeaders() {
        if (this.cookie && this.ItemURL) {
            this.headers.append('cookie', this.cookie);
            this.headers.append('Referer', this.ItemURL);
            return;
        }

        newError('One or more important header settings doesnt exist');
    }

    private urlEncoded(): BodyInit | null | undefined {
        if (this.token) {
            const urlencoded = new URLSearchParams();
            urlencoded.append('_token', this.token);
            return urlencoded;
        }

        newError('_token is undefined.');
        return null;
    }

    private checkStatus(resp: Response) {
        if (resp.status === 419) {
            newError('CF session expired or token is invalid');
        }

        if (resp.status === 401) {
            newError('Cookie has expired');
        }
    }

    async checkCookieStatus() {
        const data = await this.fetchData('https://www.bloxcity.com/forum');
        const parsed = parse(data);

        if (!parsed.querySelectorAll('meta[name="user-data"]')) {
            newError('Cookie has expired');
        }

        console.log('Cookie is valid');
    }

    private async getToken(URL: string) {
        try {
            const data = await this.fetchData(URL);
            const parsedData = parse(data);
            parsedData?.querySelectorAll('script').forEach((el) => {
                const scriptElement = el as unknown as HTMLScriptElement;
                if (scriptElement.src === undefined) {
                    const inputRegex = /<input\b[^>]*>/gi;
                    const inputs = el.toString().match(inputRegex);
                    if (inputs !== null) {
                        inputs.forEach((el) => {
                            const valueRegex =
                                /<input[^>]*\bname\s*=\s*["_']_token["_'][^>]*\bvalue\s*=\s*["_']([^"_']*)["_'][^>]*>/gi;
                            if (el.match(valueRegex)) {
                                const token = valueRegex.exec(el);
                                if (token) {
                                    this.token = token[1];
                                    console.log('Token has been found');
                                    return;
                                }
                                return;
                            } else {
                                return;
                            }
                        });
                    }
                }
            });
        } catch (err) {
            console.error('An error occured while fetching token');
            throw err;
        }
    }

    private async buyItem(URL: string) {
        try {
            this.applyHeaders();

            const requestOptions: RequestInit = {
                method: 'POST',
                headers: this.headers,
                body: this.urlEncoded(),
                redirect: 'follow',
            };

            const time = getRandomArbitrary(1500, 3400) ?? 1838;

            setTimeout(async () => {
                if (this.itemPriceCash && this.itemPriceCash <= this.maxCash) {
                    console.log('Trying to buy with cash');
                    const buy = await fetch(this.ItemURL + '/buy/1', requestOptions);
                    this.checkStatus(buy);

                    console.log('Bought with cash');
                    return;
                }

                if (!this.itemPriceCash && this.itemPriceCoins && this.itemPriceCoins <= this.maxCoins) {
                    console.log('Trying to buy with coins');
                    const buy = await fetch(this.ItemURL + '/buy/2', requestOptions);
                    this.checkStatus(buy);

                    console.log('Bought with coins');
                    return;
                }
            }, time);
        } catch (err) {
            console.error(`Error occured while performing purchase`);
            throw err;
        }
    }

    private logDetails() {
        console.log(
            `
            Name: ${this.itemName}, \n
            Sold out: ${!this.itemPriceCash && !this.itemPriceCoins ? true : false} \n
            Cash: ${this.itemPriceCash}, \n
            Coins: ${this.itemPriceCoins}, \n
            URL: ${this.ItemURL}, \n
            Collectible: ${this.Collectible}, \n
            `
        );
    }

    async startNotifier() {
        const data = (await this.fetchData(this.marketURL)) ?? newError('Failed to use this.fetchData()');
        const parsedData = parse(data);

        const itemCellPosition = 0;
        const itemCell = parsedData.querySelectorAll('.market-item-cell')[itemCellPosition];
        const itemDetails = itemCell?.querySelector('.market-item-name');

        this.itemName = itemDetails?.innerText;
        this.ItemURL = itemDetails?.getAttribute('href');
        const cash = itemCell?.querySelector('.market-item-price-cash')?.innerText as string;
        const coins = itemCell?.querySelector('.market-item-price-coins')?.innerText as string;
        cash !== undefined ? (this.itemPriceCash = parseInt(cash)) : undefined;
        coins !== undefined ? (this.itemPriceCoins = parseInt(coins)) : undefined;

        this.Collectible = itemCell.querySelector('.ribbon')?.innerText === 'Collectible' ? true : false;

        if (!this.ItemURL) {
            console.log('No item URL been found');
            return;
        }

        if (this.ItemURL === this.latestItemURL) {
            console.log('searching...');
            return;
        }

        if (!this.Collectible) {
            console.log('Normal item');
            this.logDetails();
            return;
        }

        if (
            this.Collectible &&
            this.ItemURL &&
            !itemCell.querySelector('.market-item-price')?.innerText.includes('Remaining')
        ) {
            if (
                itemCell.querySelector('.market-item-price')?.innerText === 'Sold out' ||
                (this.itemPriceCash === undefined && this.itemPriceCoins === undefined)
            ) {
                this.logDetails();
                console.log('Item sold out');
                return;
            }
        }

        if (this.ItemURL) {
            console.log('getting token');
            await this.getToken(this.ItemURL);
        }

        await this.buyItem(this.ItemURL);
        this.latestItemURL = this.ItemURL;
        this.logDetails();
        return;
    }
}

export default Notifier;
