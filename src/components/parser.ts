import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

class Parser {
    parseData(data: string): HTMLElement {
        return parse(data);
    }

    extractToken(data: string): string | undefined {
        const parsedData = this.parseData(data);
        let token: string | undefined;
        parsedData.querySelectorAll('script').forEach((el) => {
            const scriptElement = el as unknown as HTMLScriptElement;
            if (scriptElement.src === undefined) {
                const inputRegex = /<input\b[^>]*>/gi;
                const inputs = el.toString().match(inputRegex);
                if (inputs !== null) {
                    inputs.forEach((el) => {
                        const valueRegex =
                            /<input[^>]*\bname\s*=\s*["_']_token["_'][^>]*\bvalue\s*=\s*["_']([^"_']*)["_'][^>]*>/gi;
                        if (el.match(valueRegex)) {
                            const tokenMatch = valueRegex.exec(el);
                            if (tokenMatch) {
                                token = tokenMatch[1];
                            }
                        }
                    });
                }
            }
        });
        return token;
    }

    setItemDetails(parsedData: HTMLElement): {
        itemName: string;
        itemUrl: string;
        priceCash: number;
        priceCoins: number;
        collectible: boolean;
        itemCell: HTMLElement;
    } {
        const itemCellPosition = 0;
        const itemCell = parsedData.querySelectorAll('.market-item-cell')[itemCellPosition];
        const itemDetails = itemCell?.querySelector('.market-item-name');
        const itemName = itemDetails?.innerText ?? '';
        const itemUrl = itemDetails?.getAttribute('href') ?? '';
        const priceCash = parseInt(itemCell?.querySelector('.market-item-price-cash')?.innerText as string);
        const priceCoins = parseInt(itemCell?.querySelector('.market-item-price-coins')?.innerText as string);
        const collectible = itemCell.querySelector('.ribbon')?.innerText === 'Collectible';

        return { itemName, itemUrl, priceCash, priceCoins, collectible, itemCell };
    }
}

export default Parser;