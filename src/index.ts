import "./lib/env";
import Nameserver from "./dns/nameserver";
import Filter from "./dns/filter";


(async () => {

	const filter = await Filter.initialize();

	let nameserver = new Nameserver(filter);
	nameserver.start();

})();