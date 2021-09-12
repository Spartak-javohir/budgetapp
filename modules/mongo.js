const { MongoClient } = require("mongodb");

const mongoAtlasUrl =
	"mongodb+srv://mongoUser:mongoparol@cluster0.clekl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const url = "mongodb://localhost:27017"
const client = new MongoClient(mongoAtlasUrl);

async function mongo() {
	try {
		await client.connect();

		const db = await client.db("usersystem");

		// const users = await db.collection("users");
		// const data = await db.collection("data")

		return db;
	} catch (error) {
		console.log(error);
	}
}

module.exports = mongo;