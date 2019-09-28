///<reference path="../../typings/dns-packet.d.ts" />

import {createSocket, Socket, RemoteInfo} from "dgram";
import {decode, encode} from "dns-packet";
import {query} from "./upstream-client";
import Filter from "./filter";

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

			let blockedQuestions = message.questions.filter(question => {
				return this.filter.isBlocked(question.name)
			});

			if (message.questions.length !== blockedQuestions.length) {

				query(message).then(response => {
					const data = encode(response);
					this.socket.send(data, 0, data.length, rinfo.port, rinfo.address, (error, bytes) => {
						if (error) console.error(error);
						else {
							console.log(`Sent ${bytes} bytes to ${rinfo.address}:${rinfo.port}`);
						}
					});
				});

			} else {

				let blockedDomains = blockedQuestions.map(val => val.name);
				console.log('blocked request to ' + blockedDomains.join(', '));

			}

		});
	}

}