import newError from 'src/utils/newError';

class Fetcher {
    private headers: Headers;
    private cookie: string;
    private cf_clearance: string;
    private referer: string | undefined;
    private token: string | undefined = undefined;

    constructor(headers: Headers, cookie: string, referer: string | undefined, cf_clearance: string) {
        this.headers = headers;
        this.cookie = cookie;
        this.referer = referer;
        this.cf_clearance = cf_clearance;
    }

    async getData(URL: string): Promise<string> {
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
    }

    async postData(URL: string, token?: string) {
        this.token = token;

        const resp = await fetch(URL, {
            method: 'POST',
            headers: this.headers,
            redirect: 'follow',
            body: this.urlEncodedToken(),
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! Status: ${resp.status}`);
        }

        return resp;
    }

    applyCfClearance(): void {
        if (this.cf_clearance) {
            this.headers.append('cookie', this.cf_clearance);
            return;
        }
        newError('cf_clearance doesnt exist');
    }

    applyHeaders(): void {
        if (this.cookie) {
            this.headers.append('cookie', this.cookie);

            if (this.referer) {
                this.headers.append('Referer', this.referer);
            }
            return;
        }

        newError('One or more important header settings doesnt exist');
    }

    removeHeaders(): void {
        this.headers.delete('cookie');
        this.headers.delete('Referer');
    }

    private urlEncodedToken(): BodyInit | null | undefined {
        if (this.token) {
            const urlencoded = new URLSearchParams();
            urlencoded.append('_token', this.token);
            return urlencoded;
        }

        newError('_token is undefined.');
    }
}

export default Fetcher;
