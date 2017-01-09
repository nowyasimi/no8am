import boto3
import time
import json
import os
import StringIO
from flask_assets import Bundle
from webassets.filter import register_filter
from webassets_browserify import Browserify

from no8am import generate_course_descriptions, DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST, STATIC_LOCATION, \
	CLOUDFRONT_DISTRIBUTION_ID, assets

S3_BUCKET_NAME = "no8.am"
JS_OUTPUT_FILENAME = "app.js"
PROD_JS_OUTPUT_FILENAME = "prod-app.js"

course_descriptions = None
output_stream = StringIO.StringIO()

register_filter(Browserify)

assets.cache = False
assets.manifest = None

js_files_development = Bundle('js/Index.js', filters=['browserify'], output=JS_OUTPUT_FILENAME)
js_files_production = Bundle('js/Index.js', filters=['browserify', 'uglifyjs'], output=PROD_JS_OUTPUT_FILENAME)

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

	:return: A dictionary containing metadata
	"""

	global course_descriptions

	if course_descriptions is None:
		with open("no8am/static/bucknellCourseDescriptions.json", 'r') as f:
			course_descriptions = json.loads(f.read())

	metadata = {
		"course": course_descriptions,
		"department": DEPARTMENT_LIST,
		"ccc": CCC_LIST,
		"credit": CREDIT_LIST
	}

	return json.dumps(metadata, ensure_ascii=False)

	return output.getvalue()


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


def update_static_files():
	"""
	Minifies and pushes static assets to S3 and invalidates the cache in Amazon Cloudfront. The files are minified to
	reduce the number of requests the client needs to make when retrieving static assets. The cache invalidation is made
	to reduce the time needed for the client to access the updated files.
	"""

	# TODO - write metadata file to S3 for general use

	global course_descriptions

	# Ask developer if static file update is necessary
	if STATIC_LOCATION == "local":
		update_static = None
	else:
		update_static = 'y'
		course_descriptions = generate_course_descriptions()

	while update_static not in ['y', 'n']:
		update_static = raw_input("Update static files? [y/n]: ")

	if update_static == 'n':
		return

	print "updating static"
	s3 = boto3.resource('s3')
	cloudfront = boto3.client('cloudfront')

	# delete old file minified file and generate and upload new minified JS (.urls() method runs file through minifier)
	os.remove('no8am/static/' + PROD_JS_OUTPUT_FILENAME)
	js_files_production.urls()
	s3.Object(S3_BUCKET_NAME, 'static/' + JS_OUTPUT_FILENAME).put(Body=open("no8am/static/"+PROD_JS_OUTPUT_FILENAME, 'rb'), ContentType='application/javascript', CacheControl='max-age=900')

	# generate and upload minified CSS
	to_minify = ["home.css", "bucknell.css"]
	for m in to_minify:
		data = minify_css(m)
		s3.Object(S3_BUCKET_NAME, 'static/min_css/' + m).put(Body=data, ContentType = 'text/css', CacheControl='max-age=900')

	# upload all other files to S3
	files = ["bg.png", "fonts/glyphicons-halflings-regular.eot", "fonts/glyphicons-halflings-regular.svg",
	"fonts/glyphicons-halflings-regular.ttf", "fonts/glyphicons-halflings-regular.woff",
	"fonts/glyphicons-halflings-regular.woff2", "favicon.ico"]
	for f in files:
		s3.Object(S3_BUCKET_NAME, 'static/' + f).put(Body=open("no8am/static/" + f, 'rb'))

	# invalidate CloudFront cache
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
