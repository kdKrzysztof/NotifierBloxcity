import type Parser from './parser';

class Logger {
    logDetails(itemDetails: ReturnType<Parser['setItemDetails']>): void {
        const { collectible, itemCell, itemName, itemUrl, priceCash, priceCoins } = itemDetails;
        console.log(
            `
            Name: ${itemName}, \n
            Sold out: ${!priceCash && !priceCoins ? true : false} \n
            Cash: ${priceCash}, \n
            Coins: ${priceCoins}, \n
            URL: ${itemUrl}, \n
            Collectible: ${collectible}, \n
            `
        );
    }
}

export default Logger;
