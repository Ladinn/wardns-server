import "./lib/env";
import Nameserver from "./socket/nameserver";
import Filter from "./socket/filter";


(async () => {

	const filter = await Filter.initialize();

	let nameserver = new Nameserver(filter);
	nameserver.start();

})();