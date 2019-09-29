import { connect } from "mongoose";

connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(
	() => {
		console.log('[DB] Connected to MongoDB server.');
	}, error => {
		throw error;
	}
);