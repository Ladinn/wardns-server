///<reference path="../../typings/dns-packet.d.ts" />

import {Answer, Packet} from "dns-packet";
import {RemoteInfo} from "dgram";
import {hostname} from "os";
import {Query} from "./models/query";
import {Blocked} from "./models/blocked";
import {Client} from "./models/client";
import {Upstream} from "./models/upstream";
import {Server} from "./models/server";

export function upsertQuery(packet: Packet) {
	packet.questions.forEach(question => {
		let count: { [key: string]: number } = {};
		count[`count.${question.type}`] = 1;
		Query.findOneAndUpdate(
			{ name: question.name }, { $inc: count }, { upsert: true },
			(error) => {
				if (error) {
					if (error.code === 11000) {
						upsertQuery(packet);
					} else {
						console.error(error);
					}
				}
			}
		);
	});
}

export function upsertBlocked(answer: Answer) {
	let count: { [key: string]: number } = {};
	count[`count.${answer.type}`] = 1;
	Blocked.findOneAndUpdate(
		{ name: answer.name }, { $inc: count }, { upsert: true },
		(error) => {
			if (error) {
				if (error.code === 11000) {
					upsertBlocked(answer);
				} else {
					console.error(error);
				}
			}
		}
	);
}

export function upsertClient(rinfo: RemoteInfo) {
	let count: { [key: string]: number } = {
		queries: 1,
		bytes: rinfo.size
	};
	Client.findOneAndUpdate(
		{ ip: rinfo.address }, { $inc: count }, { upsert: true },
		(error) => {
			if (error) {
				if (error.code === 11000) {
					upsertClient(rinfo);
				} else {
					console.error(error);
				}
			}
		}
	);
}

export function upsertUpstream(ip?: string, len?: number) {
	Upstream.findOneAndUpdate(
		{ ip: ( ip !== undefined ? ip : 'cache' ) }, {
			$inc: {
				queries: 1,
				bytes: ( len !== undefined ? len : 0 )
			}
		}, { upsert: true },
		(error) => {
			if (error) {
				if (error.code === 11000) {
					upsertUpstream(ip, len);
				} else {
					console.error(error);
				}
			}
		}
	);
}

export function upsertServer(rinfo: RemoteInfo) {
	Server.findOneAndUpdate(
		{ host: hostname() },
		{
			$inc: {
				queries: 1,
				bytes: rinfo.size
			}
		}, { upsert: true },
		(error) => {
			if (error) {
				if (error.code === 11000) {
					upsertServer(rinfo);
				} else {
					console.error(error);
				}
			}
		}
	)
}