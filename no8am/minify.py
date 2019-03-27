import boto3
import time
import json
import os
import StringIO
from flask_assets import Bundle
from webassets.filter import register_filter
from webassets_browserify import Browserify

from no8am import generate_course_descriptions, DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST, \
	CLOUDFRONT_DISTRIBUTION_ID, assets, get_current_term

S3_BUCKET_NAME = "no8.am"
JS_OUTPUT_FILENAME = "app.js"
PROD_JS_OUTPUT_FILENAME = "prod-app.js"

course_descriptions = None
output_stream = StringIO.StringIO()

register_filter(Browserify)

assets.cache = False
assets.manifest = False

js_files_development = Bundle('js/Index.js', filters=['browserify'], depends='js/*', output=JS_OUTPUT_FILENAME)
js_files_production = Bundle('js/Index.js', filters=['browserify', 'uglifyjs'], depends='js/*', output=PROD_JS_OUTPUT_FILENAME)

css_home = Bundle('css/bootstrap.min.css', 'css/home.css', filters='cleancss', output='min_css/home.css')
css_bucknell = Bundle('css/bootstrap.min.css', 'css/calendar.css', filters='cleancss', output='min_css/bucknell.css')

assets.register('app-js', js_files_development)
assets.register('app-js-prod', js_files_production)
assets.register('home-css', css_home)
assets.register('bucknell-css', css_bucknell)


def generate_metadata():
	"""
	Creates a metadata object containing course descriptions, department names, ccc names, and credit types. This data
	is added to the minified javascript file that is uploaded to S3. It is also sent directly to the browser during
	debugging.

	:return: A JSON-formatted string containing metadata
	"""

	global course_descriptions

	if course_descriptions is None:
		with open("no8am/static/bucknellCourseDescriptions.json", 'r') as f:
			course_descriptions = json.loads(f.read())

	metadata = {
		"semester": get_current_term()["Description"],
		"course": course_descriptions,
		"department": DEPARTMENT_LIST,
		"ccc": CCC_LIST,
		"credit": CREDIT_LIST
	}

	return json.dumps(metadata, ensure_ascii=False)


def minify_css(file):
	"""
	Runs files through CSS minification program. Used for uploading to S3.

	:param file_list: Files to minify
	:return: Minified files bundled together in one string.
	"""

	output = StringIO.StringIO()

	if file == 'home.css':
		css_home.build(force=True, output=output, disable_cache=True)
	elif file == 'bucknell.css':
		css_bucknell.build(force=True, output=output, disable_cache=True)

	return output.getvalue()


def invalidate_cache():

	cloudfront = boto3.client('cloudfront')

	response = cloudfront.create_invalidation(
		DistributionId=CLOUDFRONT_DISTRIBUTION_ID,
		InvalidationBatch={
			'Paths': {
				'Quantity': 1,
				'Items': ['/*']
			},
			'CallerReference': str(int(time.time()))
		}
	)

	print response


def update_metadata():
	"""
	Get course descriptions and use them to create a new metadata dictionary. This dictionary is uploaded to S3 and is
	used for the autocomplete search box.
	"""

	global course_descriptions

	course_descriptions = generate_course_descriptions()
	metadata = generate_metadata()
	remote_metadata_path = 'static/metadata.json'

	s3 = boto3.resource('s3')

	s3.Object(S3_BUCKET_NAME, remote_metadata_path)\
		.put(Body=metadata, ContentType='application/json', CacheControl='max-age=900')


def update_static_files():
	"""
	Minifies and pushes static assets to S3 and invalidates the cache in Amazon Cloudfront. The files are minified to
	reduce the number of requests the client needs to make when retrieving static assets. The cache invalidation is made
	to reduce the time needed for the client to access the updated files.
	"""

	global course_descriptions

	print "updating static"
	s3 = boto3.resource('s3')

	# delete old file minified file and generate and upload new minified JS (.urls() method runs file through minifier)
	prod_js_path = 'no8am/static/' + PROD_JS_OUTPUT_FILENAME
	if os.path.isfile(prod_js_path):
		os.remove(prod_js_path)
	js_files_production.urls()
	s3.Object(S3_BUCKET_NAME, 'static/' + JS_OUTPUT_FILENAME).\
		put(Body=open(prod_js_path, 'rb'), ContentType='application/javascript', CacheControl='max-age=900')

	# generate and upload minified CSS
	to_minify = ["home.css", "bucknell.css"]
	for m in to_minify:
		data = minify_css(m)
		s3.Object(S3_BUCKET_NAME, 'static/min_css/' + m).\
			put(Body=data, ContentType='text/css', CacheControl='max-age=900')

	# upload all other files to S3
	files = ["bg.png", "fonts/glyphicons-halflings-regular.eot", "fonts/glyphicons-halflings-regular.svg",
	"fonts/glyphicons-halflings-regular.ttf", "fonts/glyphicons-halflings-regular.woff",
	"fonts/glyphicons-halflings-regular.woff2", "favicon.ico"]

	for f in files:
		s3.Object(S3_BUCKET_NAME, 'static/' + f).put(Body=open("no8am/static/" + f, 'rb'))
