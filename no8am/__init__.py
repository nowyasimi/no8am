from flask import Flask
from flask_cdn import CDN
from flask_assets import Environment, Bundle
from webassets.filter import register_filter
from webassets_browserify import Browserify
import os

app = Flask(__name__)

secret_key = os.environ.get("SECRET_KEY") or "something_super_secret"
APPLICATION_ROOT = os.environ.get('APPLICATION_ROOT') or ""
STATIC_LOCATION = os.environ.get('STATIC_LOCATION') or "local"
SIMPLE_FORM_TOKEN = os.environ.get("SIMPLE_FORM_TOKEN")
CLOUDFRONT_DISTRIBUTION_ID = os.environ.get("CLOUDFRONT_DISTRIBUTION_ID")
REDIS_PASS = os.environ.get("REDIS_PASS")
REDIS_SERVER = os.environ.get("REDIS_SERVER")

app.config.update(
    SECRET_KEY=secret_key,
    CDN_DOMAIN="static.no8.am",
    CDN_HTTPS=True,
    CDN_TIMESTAMP=False,
    BROWSERIFY_BIN='./node_modules/.bin/browserifyinc',
    CLEANCSS_BIN='./node_modules/.bin/cleancss',
    CLEANCSS_EXTRA_ARGS=['--skip-rebase']
)

from no8am.metadata import DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST
from no8am.cache import course_data_get, course_data_set
from no8am.database import store_link, get_link, generate_short_link
from no8am.utility import get_bucknell_format_semester, generate_course_descriptions, get_user_format_semester
from no8am.minify import update_static_files, generate_metadata, JS_OUTPUT_FILENAME
from no8am.scraper import Department, CreditOrCCC, find_course_in_department, fetch_section_details

import no8am.views


if STATIC_LOCATION == "local":
    register_filter(Browserify)

    assets = Environment(app)
    assets.cache = False
    assets.manifest = None

    js_files_development = Bundle('js/Index.js', filters=['browserify'], output=JS_OUTPUT_FILENAME)
    js_files_production = Bundle('js/Index.js', filters=['browserify', 'uglifyjs'], output=JS_OUTPUT_FILENAME)

    css_home = Bundle('css/bootstrap.min.css', 'css/home.css', filters='cleancss', output='min_css/home.css')
    css_bucknell = Bundle('css/bootstrap.min.css', 'css/calendar.css', filters='cleancss', output='min_css/bucknell.css')

    assets.register('app-js', js_files_development)
    assets.register('home-css', css_home)
    assets.register('bucknell-css', css_bucknell)

CDN(app)
