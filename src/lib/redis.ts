import { createClient, RedisClient } from "redis";

const client: RedisClient = createClient({
	port: 6379,
	host: '127.0.0.1'
});

client.on('error', error => {
	throw error;
});

export default client;