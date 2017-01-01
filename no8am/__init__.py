from flask import Flask
app = Flask(__name__)

app.config.update(
		SECRET_KEY="\xc6lx<\x01\xefO\x9c\x81\x12}\x16q\x0c\xd4\x9dCd\x93\x93\x18\xa7f\x87"
	)

from no8am.cache import cache_get_string, course_data_get, course_data_set
from no8am.database import store_link, get_link, generate_short_link
from no8am.utility import get_bucknell_format_semester, generate_course_descriptions, convert_descriptions_to_string
from no8am.minify import jsBucknell, update_static_files
from no8am.scraper import Department, CreditOrCCC, find_course_in_department, fetch_section_details

import no8am.views
