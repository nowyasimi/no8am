from no8am import app

if __name__ == '__main__':
	app.config.update(
		ASSETS_DEBUG=True,
		BROWSERIFY_BIN='./node_modules/.bin/browserify'
	)
	app.run(debug=True, port=3000)