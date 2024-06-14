import parse from 'node-html-parser';
import newError from 'src/utils/newError';

class Notifier {
    private latestItemURL: string = '';
    private itemName: string | undefined = '';
    private itemPriceCash: number | undefined = undefined;
    private itemPriceCoins: number | undefined = undefined;
    private ItemURL: string | undefined = '';
    private Collectible: boolean = false;
    private isPurchased: boolean = false;
    private token: string | undefined = '';
    private readonly marketURL: string = '';
    private readonly headers: Headers;
    private readonly cookie: string = '';

    constructor(iCookie: string, iHeaders: Headers, MarketURL: string) {
        this.cookie = iCookie;
        this.headers = iHeaders;
        this.marketURL = MarketURL;
        this.headers.append('cookie', this.cookie);
    }

    private async fetchData(URL: string) {
        try {
            const resp = await fetch(URL, {
                method: 'GET',
                headers: this.headers,
            });

            if (!resp.ok) {
                throw new Error(`HTTP error! Status: ${resp.status}`);
            }

            const data = await resp.text();
            return data;
        } catch (err) {
            console.error('Error while fetching data.');
            throw err;
        }
    }

    private async getItemPage(URL: string) {
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
                                console.log(token[1]);
                            }
                        }
                    });
                }
                return;
            }
        });
        process.exit(1);
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
        }

        newError('_token is undefined.');
        return null;
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

            if (this.itemPriceCash && this.itemPriceCash <= 10) {
                const buy = await fetch(this.ItemURL + '/buy/1', requestOptions);

                if (buy.status === 302) {
                    newError('Cookie expired or headers not compatible');
                }

                this.isPurchased = true;
            }
        } catch (err) {
            throw new Error(`Error occured while performing purchase`);
        }
    }

    private logDetails() {
        console.log(
            `Name: ${this.itemName}, \n
            Cash: ${this.itemPriceCash}, \n
            Coins: ${this.itemPriceCoins}, \n
            URL: ${this.ItemURL}, \n
            Collectible: ${this.Collectible}, \n
            Purchased: ${this.isPurchased}
            `
        );
    }

    async startNotifier(time: number) {
        setInterval(async () => {
            const data = (await this.fetchData(this.marketURL)) ?? newError('Failed to use this.fetchData()');
            const parsedData = parse(data);

            const itemCellPosition = 1;
            const itemCell = parsedData.querySelectorAll('.market-item-cell')[itemCellPosition];
            const itemDetails = itemCell?.querySelector('.market-item-name');

            this.itemName = itemDetails?.innerText;
            this.ItemURL = itemDetails?.getAttribute('href');
            const cash = itemCell?.querySelector('.market-item-price-cash')?.innerText as string;
            const coins = itemCell?.querySelector('.market-item-price-coins')?.innerText as string;
            cash !== undefined ? (this.itemPriceCash = parseInt(cash)) : undefined;
            coins !== undefined ? (this.itemPriceCoins = parseInt(coins)) : undefined;

            const isCollectible = itemCell.querySelector('.ribbon')?.innerText === 'Collectible' ? true : false;

            if (this.ItemURL === this.latestItemURL) {
                console.log('searching...');
                return;
            }

            if (this.ItemURL) {
                console.log('getitng items page!!!');
                await this.getItemPage(this.ItemURL);
            }

            if (isCollectible && this.ItemURL) {
                if (
                    itemCell.querySelector('.market-item-price')?.innerText === 'Sold out' ||
                    (this.itemPriceCash === undefined && this.itemPriceCoins === undefined)
                ) {
                    this.logDetails();
                    console.log('Item sold out');
                    return;
                }
                console.log(this.itemPriceCash, this.itemPriceCoins);
            } else {
                console.log('Item isnt a collectible or ItemURL doesnt exist');
                this.logDetails();
                return;
            }

            this.buyItem(this.ItemURL);
            this.logDetails();
        }, time);
    }
}

export default Notifier;
