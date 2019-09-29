import { Socket } from "net";
import {Packet, streamEncode, streamDecode, Answer, RECURSION_DESIRED, RECURSION_AVAILABLE} from "dns-packet";
import { each } from "async";
import redis from "../lib/redis";
import {upsertUpstream} from "../stats/update-database";

const upstream = process.env.UPSTREAM_NS.split(',');

export function query(packet: Packet): Promise<Packet> {
	return new Promise((resolve, reject) => {

		let answers: Answer[] = [];

		each(packet.questions, (value, callback) => {
			let key = JSON.stringify({
				type: value.type,
				name: value.name
			});
			redis.get(key, (error, result) => {
				if (result !== null) {
					const data = JSON.parse(result);
					const seconds = new Date().getTime() / 1000;
					if (data.expires > seconds) {
						answers.push(data);
					} else {
						console.log(`[NS] Deleting cached data for: ${value.name}`);
						redis.del(key);
					}
				}
				callback(error);
			});
		}, (error) => {

			if (error) {
				console.error(error);
			}

			if (answers.length === packet.questions.length) {

				upsertUpstream();

				resolve({
					...packet,
					type: 'response',
					flags: RECURSION_DESIRED || RECURSION_AVAILABLE,
					answers: answers
				});

			} else {

				const data = streamEncode(packet);

				const client = new Socket();
				const dest = randomUpstreamAddress();

				upsertUpstream(dest, data.length);

				let response: Buffer = null;
				let expectedLength: number = 0;

				client.connect(53, dest, () => client.write(data));

				client.on('data', (data: Buffer) => {

					if (response == null) {
						if (data.byteLength > 1) {
							const plen = data.readUInt16BE(0);
							expectedLength = plen;
							if (plen < 12) {
								reject(new Error('Response from upstream nameserver is below the DNS minimum packet length.'));
							}
							response = Buffer.from(data)
						}
					} else {
						response = Buffer.concat([response, data])
					}

					if (response.byteLength >= expectedLength) {
						client.destroy();
						const decodedResponse = streamDecode(response);
						decodedResponse.answers.forEach(answer => {
							redis.set(JSON.stringify({
								type: answer.type,
								name: answer.name
							}), JSON.stringify({
								...answer,
								expires: Math.round(new Date().getTime() / 1000) + answer.ttl
							}));
						});
						resolve(decodedResponse);
					}

				});

				client.on('error', (error) => {
					client.destroy();
					console.error(`Socket error while communicating with ${dest}: ${error.message}`);
					resolve(query(packet));
				});

			}

		});

	});
}

function randomUpstreamAddress(): string {
	return upstream[Math.floor(Math.random() * upstream.length)];
}