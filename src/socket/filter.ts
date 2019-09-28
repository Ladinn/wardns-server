import axios, { AxiosResponse } from "axios";
import { each } from "async";
import * as ora from "ora";

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const DOMAIN_REGEX = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;

export default class Filter {

	private blockedDomains: string[];

	constructor(blockedDomains: string[]) {
		this.blockedDomains = blockedDomains;
	}

	static initialize(): Promise<Filter> {
		return new Promise((resolve, reject) => {
			let blockedDomains: string[] = [];
			const loading = ora('Initializing blocked domains.').start();
			axios({
				method: 'get',
				url: process.env.BLOCKED_LIST
			}).then(
				(response: AxiosResponse) => {
					let urls: string[] = response.data.match(URL_REGEX);
					let i = 0;
					each(urls, (url, callback) => {
						axios.get(url).then(
							(response: AxiosResponse) => {
								let domains = response.data.match(DOMAIN_REGEX);
								blockedDomains = blockedDomains.concat(domains);
								loading.text = `Initializing blocked domains: ${++i}/${urls.length}`;
								callback();
							}, error => callback(error)
						);
					}, (error) => {
						loading.stop();
						if (error) {
							console.error('Error while initializing blocked domains:');
							console.error(error);
						}
						console.log(`Loaded ${blockedDomains.length} domains into memory.`);
						resolve(new Filter(blockedDomains));
					});
				},
				reject
			);
		});
	}

	public isBlocked(domain: string): boolean {
		return this.blockedDomains.includes(domain);
	}

}