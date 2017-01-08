from no8am import app

if __name__ == '__main__':
	app.config.update(
		BROWSERIFY_BIN='./node_modules/.bin/browserifyinc'
	)
	app.run(debug=True, port=3000)