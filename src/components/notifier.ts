import parse from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
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
    private iterationNumber: number = 1;
    private iterationNumberCheck: number;
    private maxIterationNumber: number;
    private readonly marketURL: string = '';
    private readonly headers: Headers;
    private readonly cookie: string = '';
    private readonly maxCash: number = 0;
    private readonly maxCoins: number = 0;

    constructor(
        iCookie: string,
        iHeaders: Headers,
        MarketURL: string,
        iMaxCash: number,
        iMaxCoins: number,
        iIterationNumberLimit: number
    ) {
        this.cookie = iCookie;
        this.headers = iHeaders;
        this.marketURL = MarketURL;
        this.maxCash = iMaxCash;
        this.maxCoins = iMaxCoins;
        this.maxIterationNumber = iIterationNumberLimit;
        this.iterationNumberCheck = this.maxIterationNumber;
    }

    private async fetchData(URL: string): Promise<string> {
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

    private applyHeaders(): void {
        if (this.cookie) {
            this.headers.append('cookie', this.cookie);

            if (this.ItemURL) {
                this.headers.append('Referer', this.ItemURL);
            }
            return;
        }

        newError('One or more important header settings doesnt exist');
    }

    private removeHeaders(): void {
        this.headers.delete('cookie');
        this.headers.delete('Referer');
    }

    private urlEncoded(): BodyInit | null | undefined {
        if (this.token) {
            const urlencoded = new URLSearchParams();
            urlencoded.append('_token', this.token);
            return urlencoded;
        }

        newError('_token is undefined.');
    }

    private checkStatus(resp: Response): void {
        if (resp.status === 419) {
            newError('CF session expired or token is invalid');
        }
    }

    async checkCookieStatus(iParsedData?: HTMLElement): Promise<void> {
        let parsedData = iParsedData;

        if (!parsedData) {
            console.log('Scraped data not found, fetching new data...');
            this.applyHeaders();
            const data = await this.fetchData('https://www.bloxcity.com/market');
            parsedData = parse(data);
            this.removeHeaders();
            console.log('Scraped new data, parsedData applied');
        }

        if (parsedData && parsedData.querySelectorAll('meta[name="user-data"]').length === 0) {
            newError('Cookie has expired');
        }

        console.log('Cookie is valid');
    }

    private async getToken(URL: string): Promise<void> {
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
                            }
                            return;
                        });
                    }
                }
            });
        } catch (err) {
            console.error('An error occured while fetching token');
            throw err;
        }
    }

    private async buyItem(URL: string): Promise<void> {
        try {
            this.applyHeaders();

            const requestOptions: RequestInit = {
                method: 'POST',
                headers: this.headers,
                body: this.urlEncoded(),
                redirect: 'follow',
            };

            const time = getRandomArbitrary(1100, 1900) ?? 1538;

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

    private logDetails(): void {
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

    private setItemDetails(itemCell: HTMLElement): void {
        const itemDetails = itemCell?.querySelector('.market-item-name');

        this.itemName = itemDetails?.innerText;
        this.ItemURL = itemDetails?.getAttribute('href');
        this.itemPriceCash = parseInt(itemCell?.querySelector('.market-item-price-cash')?.innerText as string);
        this.itemPriceCoins = parseInt(itemCell?.querySelector('.market-item-price-coins')?.innerText as string);

        this.Collectible = itemCell.querySelector('.ribbon')?.innerText === 'Collectible' ? true : false;
    }

    private iterationChecker(parsedData: HTMLElement): void {
        console.log(`Iteration number: ${this.iterationNumber}`);

        if (this.iterationNumber === this.iterationNumberCheck) {
            this.checkCookieStatus(parsedData);
            this.iterationNumberCheck += this.maxIterationNumber;
            console.log(`Another check at iteration number: ${this.iterationNumberCheck}`);
        }

        this.removeHeaders();
        this.iterationNumber++;
    }

    async startNotifier(): Promise<void> {
        if (this.iterationNumber === this.iterationNumberCheck) {
            this.applyHeaders();
        }

        const data = (await this.fetchData(this.marketURL)) ?? newError('Failed to use this.fetchData()');
        const parsedData = parse(data);
        this.iterationChecker(parsedData);

        const itemCellPosition = 0;
        const itemCell = parsedData.querySelectorAll('.market-item-cell')[itemCellPosition];
        this.setItemDetails(itemCell);

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
        this.removeHeaders();

        this.latestItemURL = this.ItemURL;
        this.logDetails();
        return;
    }
}

export default Notifier;
