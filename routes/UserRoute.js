const router = require("express").Router();
const {
	createCrypt,
	compareCrypt
} = require("../modules/bcrypt");
const {
	createToken,
	checkToken
} = require("../modules/jwt");

router.get("/", (req, res) => {
	res.render("index");
});

router.get("/signup", (req, res) => {
	res.render("sign");
});

router.post("/signup", async (req, res) => {
	const {
		email,
		password
	} = req.body;
	const users = await req.db.collection("users") 
	if (!(email && password)) {
		res.render("index", {
			error: "Email or Password not found",
		});
		return;
	}

	let user = await users.findOne({
		email: email.toLowerCase(),
	});

	if (user) {
		res.render("index", {
			error: "Email already exists",
		});
		return;
	}

	user = await users.insertOne({
		email: email.toLowerCase(),
		password: await createCrypt(password),
	});

	res.redirect("/");
});

router.post("/", async (req, res) => {
	const {
		email,
		password
	} = req.body;
	const users = await req.db.collection("users")

	if (!(email && password)) {
		res.render("index", {
			error: "Email or Password not found",
		});
		return;
	}

	let user = await users.findOne({
		email: email.toLowerCase(),
	});

	if (!user) {
		res.render("index", {
			error: "User not found",
		});
		return;
	}

	if (!(await compareCrypt(user.password, password))) {
		res.render("index", {
			error: "Password is incorrect",
		});
		return;
	}

	const token = createToken({
		user_id: user._id,
	});

	res.cookie("token", token).redirect("/profile");
});

async function AuthUserMiddleware(req, res, next) {
	if (!req.cookies.token) {
		res.redirect("/");
	}

	const isTrust = checkToken(req.cookies.token);

	if (isTrust) {
		req.user = isTrust;
		next();
	} else {
		res.redirect("/");
	}
}

router.get("/profile", AuthUserMiddleware, async (req, res) => {
	// const {input_description, input_amount, chtext, chnumber}= req.body
	const data = req.db.collection('data')

	let dt = await data.find().toArray()

	const chiqm = req.db.collection('chiqm')
	let chdt = await chiqm.find().toArray()
	
	let y = 0

	chdt.forEach(i => {
		y += Number(i.chnumber)
	});
	let x = 0

	dt.forEach(i => {
		x += Number(i.input_amount)
	});

	res.render("profile", {
		dt,
		chdt,
		y,
		x
	})



});

router.post("/krim", async (req, res) => {
	const data = req.db.collection('data')
	const {input_description, input_amount} = req.body
	data.insertOne({
		...req.body,
		time: new Date().toLocaleString()

	})
	res.redirect("/profile")
})


router.post("/chiqm", async (req, res) => {
	const chiqm = req.db.collection('chiqm')
	const {
		chtext,
		chnumber,
	} = req.body

	chiqm.insertOne({
		chtext,
		chnumber,
		time: new Date().toLocaleString()

	})

	res.redirect("/profile")
})

module.exports = {
	router,
	path: "/",
};