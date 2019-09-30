import {Time, TimeModel} from "./models/time";
import {freemem, hostname, loadavg, totalmem} from "os";

let timeSeries: any = resetTimeSeries();

function resetTimeSeries(): any {
	return {
		date: new Date(),
		host: hostname(),
		sys: {
			load: loadavg()[0],
			mem: freemem() / totalmem()
		},
		queries: 0,
		bytes: 0,
		blockedQueries: 0,
		clients: [],
		upstreamErrors: 0
	};
}

export function updateTimeSeries(data: { [key: string]: any }) {
	Object.keys(data).forEach(key => {
		if (key === 'clients') {
			if (timeSeries.clients.indexOf(data[key]) === -1) {
				timeSeries.clients.push(data.clients);
			}
		} else {
			timeSeries[key] += data[key];
		}
	});
	const timeDifference = new Date().getTime() - timeSeries.date.getTime();
	if (timeDifference > 60 * 1000) {
		const newDoc = timeSeries;
		timeSeries = resetTimeSeries();
		Time.create(newDoc).then(
			doc => {
				console.log('[STAT] Updated time series data.');
			}, error => {
				console.error(error);
			}
		)
	} else {

	}
}