import { connect } from "mongoose";

connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(
	() => {
		console.log('Connected to MongoDB server.');
	}, error => {
		throw error;
	}
);