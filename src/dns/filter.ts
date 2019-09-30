import axios, { AxiosResponse } from "axios";
import { each } from "async";

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const DOMAIN_REGEX = /^(?!http).*(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gmi;

export default class Filter {

	private blockedDomains: string[];

	constructor(blockedDomains: string[]) {
		this.blockedDomains = blockedDomains;
	}

	static initialize(): Promise<Filter> {
		return new Promise((resolve, reject) => {
			let blockedDomains: string[] = [];
			let blockedLists = process.env.BLOCKED_LISTS.split(',');
			console.log(`[NS] Reading blocked domains from ${blockedLists.length} lists.`);
			each(blockedLists, (listUrl, callback) => {
				axios({
					method: 'get',
					url: listUrl
				}).then(
					(response: AxiosResponse) => {
						let urls: string[] = response.data.match(URL_REGEX);
						each(urls, (url, callback) => {
							axios.get(url).then(
								(response: AxiosResponse) => {
									let domains = response.data.match(DOMAIN_REGEX);
									blockedDomains = blockedDomains.concat(domains);
									callback();
								}, error => callback(error)
							);
						}, callback);
					},
					reject
				);
			}, (error) => {
				if (error) {
					console.error('Error while initializing blocked domains:');
					console.error(error);
				}
				console.log(`[NS] Loaded ${blockedDomains.length} domains into memory.`);
				resolve(new Filter(blockedDomains));
			});
		});
	}

	public isBlocked(domain: string): boolean {
		return this.blockedDomains.includes(domain);
	}

}

