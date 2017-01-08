from no8am import app

if __name__ == '__main__':
	app.config.update(
		CDN_DEBUG=True
	)
	app.run(debug=True, port=3000)