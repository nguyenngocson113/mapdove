module.exports = {
	JWTSecret: 'Netvis',
	Populate: {
		User: 'username avatar _id',
		UserFull: '-salt -hashed_password'
	},
	Files: {
		Types: {
			Text: 1
		}
	}
}