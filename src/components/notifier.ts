import parse from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
import newError from 'src/utils/newError';
import getRandomArbitrary from 'src/utils/getRandomNumber';
import Fetcher from './fetcher';
import Parser from './parser';
import Buyer from './buyer';
import Logger from './logger';

class Notifier {
    private latestItemURL: string | undefined = undefined;
    private ItemURL: string | undefined = undefined;
    private token: string | undefined = undefined;
    private iterationNumber: number = 1;
    private iterationNumberCheck: number;
    private maxIterationNumber: number;
    protected readonly marketURL: string;
    protected readonly headers: Headers;
    protected readonly cookie: string;
    private readonly maxCash: number;
    private readonly maxCoins: number;
    private fetcher: Fetcher;
    private parser: Parser;
    private buyer: Buyer;
    private logger: Logger;

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
        this.fetcher = new Fetcher(this.headers, this.cookie, this.ItemURL);
        this.parser = new Parser();
        this.buyer = new Buyer(this.fetcher, this.maxCash, this.maxCoins);
        this.logger = new Logger();
    }

    async checkCookieStatus(iParsedData?: HTMLElement): Promise<void> {
        let parsedData = iParsedData;

        if (!parsedData) {
            console.log('Scraped data not found, fetching new data...');
            this.fetcher.applyHeaders();
            const data = await this.fetcher.getData('https://www.bloxcity.com/market');
            parsedData = parse(data);
            this.fetcher.removeHeaders();
            console.log('Scraped new data, parsedData applied');
        }

        if (parsedData && parsedData.querySelectorAll('meta[name="user-data"]').length === 0) {
            newError('Cookie has expired');
        }

        console.log('Cookie is valid');
    }

    private async getToken(URL: string): Promise<void> {
        try {
            this.fetcher.applyHeaders();
            const data = await this.fetcher.getData(URL);
            const token = this.parser.extractToken(data);

            if (token === undefined) {
                console.log('Token is undefined, validating cookies...');
                await this.checkCookieStatus();
            }

            this.token = token;
        } catch {
            newError('An error occured while extracting token');
        }
    }

    private iterationChecker(parsedData: HTMLElement): void {
        console.log(`Iteration number: ${this.iterationNumber}`);

        if (this.iterationNumber === this.iterationNumberCheck) {
            this.checkCookieStatus(parsedData);
            this.iterationNumberCheck += this.maxIterationNumber;
            console.log(`Another check at iteration number: ${this.iterationNumberCheck}`);
        }

        this.fetcher.removeHeaders();
        this.iterationNumber++;
    }

    async startNotifier(): Promise<void> {
        if (this.iterationNumber === this.iterationNumberCheck) {
            this.fetcher.applyHeaders();
        }

        const data = (await this.fetcher.getData(this.marketURL)) ?? newError('Failed to use this.fetchData()');
        const parsedData = this.parser.parseData(data);
        this.iterationChecker(parsedData);

        const itemDetails = this.parser.setItemDetails(parsedData);
        const { itemUrl, collectible, priceCash, priceCoins, itemCell } = itemDetails;
        this.ItemURL = itemUrl;

        if (!this.ItemURL) {
            console.log('No item URL been found');
            return;
        }

        if (this.ItemURL === this.latestItemURL) {
            console.log('Searching for new items...');
            return;
        }

        if (!collectible) {
            console.log('Normal item');
            this.logger.logDetails(itemDetails);
            return;
        }

        if (
            collectible &&
            this.ItemURL &&
            !itemCell.querySelector('.market-item-price')?.innerText.includes('Remaining')
        ) {
            if (
                itemCell.querySelector('.market-item-price')?.innerText === 'Sold out' ||
                (priceCash === undefined && priceCoins === undefined)
            ) {
                this.logger.logDetails(itemDetails);
                console.log('Item sold out');
                return;
            }
        }

        if (this.ItemURL) {
            console.log('Getting token');
            await this.getToken(this.ItemURL);
        }

        await this.buyer.buyItem(this.ItemURL, priceCoins, priceCash, this.token);
        this.fetcher.removeHeaders();

        this.latestItemURL = this.ItemURL;
        this.logger.logDetails(itemDetails);
        return;
    }
}
export default Notifier;
