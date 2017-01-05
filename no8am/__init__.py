from flask import Flask
import os

app = Flask(__name__)

secret_key = os.environ.get("SECRET_KEY") or "something_super_secret"

app.config.update(
	SECRET_KEY=secret_key
)

from no8am.metadata import DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST
from no8am.cache import cache_get_string, course_data_get, course_data_set
from no8am.database import store_link, get_link, generate_short_link
from no8am.utility import get_bucknell_format_semester, generate_course_descriptions, convert_descriptions_to_string, \
	get_user_format_semester
from no8am.minify import jsBucknell, update_static_files, generate_metadata
from no8am.scraper import Department, CreditOrCCC, find_course_in_department, fetch_section_details

import no8am.views
