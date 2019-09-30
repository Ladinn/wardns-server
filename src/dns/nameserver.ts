///<reference path="../../typings/dns-packet.d.ts" />

import {createSocket, Socket, RemoteInfo} from "dgram";
import {decode, encode, RECURSION_DESIRED, RECURSION_AVAILABLE } from "dns-packet";
import {query} from "./upstream-client";
import Filter from "./filter";
import {upsertBlocked, upsertClient, upsertQuery, upsertServer} from "../stats/update-database";

export default class Nameserver {

	private socket: Socket;
	private filter: Filter;

	constructor(filter: Filter) {
		this.filter = filter;
		this.socket = createSocket('udp4');
		this.socket.addListener('error', error => {
			console.error(error);
		});
	}

	start() {
		this.socket.bind(+process.env.NS_PORT, process.env.NS_HOST, () => {
			console.log(`[NS] DNS server listening on ${process.env.NS_HOST}:${process.env.NS_PORT}.`);
		});
		this.socket.on('message', (buffer: Buffer, rinfo: RemoteInfo) => {

			let message = decode(buffer);

			upsertQuery(message);
			query(message).then(response => {

				let answers: any[] = [];
				let blockedQueries = 0;

				response.answers.forEach(answer => {
					if (this.filter.isBlocked(answer.name)) {
						if (answer.type === 'A' || answer.type === 'AAAA') {
							blockedQueries++;
							upsertBlocked(answer);
							answer.data = (answer.type === 'AAAA' ? '::/0' : '0.0.0.0');
							console.log(`[-] Blocked request for '${answer.name}'`);
						}
					}
					answers.push(answer);
				});

				upsertClient(rinfo, blockedQueries);
				upsertServer(rinfo, blockedQueries);

				const data = encode({
					...response,
					answers: answers
				});

				this.socket.send(data, 0, data.length, rinfo.port, rinfo.address, (error, bytes) => {
					if (error) console.error(error);
					else {
						console.log(`[+] Sent ${bytes} bytes to ${rinfo.address}:${rinfo.port} | ${message.questions[0].name}`);
					}
				});

			});

		});
	}

}