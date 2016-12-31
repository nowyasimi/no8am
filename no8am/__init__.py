from flask import Flask
app = Flask(__name__)

app.config.update(
		SECRET_KEY="\xc6lx<\x01\xefO\x9c\x81\x12}\x16q\x0c\xd4\x9dCd\x93\x93\x18\xa7f\x87"
	)

import no8am.views

from no8am.minify import update_static_files