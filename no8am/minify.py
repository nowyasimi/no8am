from rcssmin import cssmin
import boto3
import time
import json
import StringIO

from no8am import app, generate_course_descriptions, DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST, STATIC_LOCATION, \
	CLOUDFRONT_DISTRIBUTION_ID

S3_BUCKET_NAME = "no8.am"
JS_OUTPUT_FILENAME = "app.js"

course_descriptions = None

# TODO - save course descriptions remotely and use remote descriptions when updating static files


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

	return "metadata=" + json.dumps(metadata, ensure_ascii=False)


def minify_javascript():
	"""
	Runs files through JavaScript minification program. Used for uploading to S3.

	:param file_list: Files to minify
	:return: Minified files bundled together in one string.
	"""

	global js_files_production

	app.config.update(
		UGLIFYJS_BIN='./node_modules/.bin/uglifyjs',
		UGLIFYJS_EXTRA_ARGS=['-c', '-m']
	)

	output = StringIO.StringIO()

	js_files_production.build(force=True, output=output, disable_cache=True)

	return output.getvalue()


def minify_css(file_list):
	"""
	Runs files through CSS minification program. Used for uploading to S3.

	:param file_list: Files to minify
	:return: Minified files bundled together in one string.
	"""

	minified = ""
	for file_name in file_list:
		with open("no8am/static/" + file_name, 'r') as f:
			contents = f.read()
		minified += cssmin(contents)
	return minified


def map_minify_name_to_files(file):
	"""
	Defines groups of files that can be minified.

	:param file: Name of group of files to minify.
	:return: Minifed files
	"""

	if file == "home.css":
		return minify_css(["css/bootstrap.min.css", "css/home.css"])
	elif file == "bucknell.css":
		return minify_css(["css/bootstrap.min.css", "css/calendar.css"])

	print "invalid page"


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

	# create the directories, if they don't exist
	directories = ["css", "fonts"]
	for d in directories:
		s3.Object(S3_BUCKET_NAME, d + '/').put(Body='')

	# generate and upload minified JS
	data = minify_javascript()
	s3.Object(S3_BUCKET_NAME, JS_OUTPUT_FILENAME).put(Body=data, ContentType='application/javascript', CacheControl='max-age=900')

	# generate and upload minified CSS
	to_minify = ["home.css", "bucknell.css"]
	for m in to_minify:
		data = map_minify_name_to_files(m)
		s3.Object(S3_BUCKET_NAME, "css/" + m).put(Body=data, ContentType = 'text/css', CacheControl='max-age=900')

	# upload all other files to S3
	files = ["css/bg.png", "fonts/glyphicons-halflings-regular.eot", "fonts/glyphicons-halflings-regular.svg",
	"fonts/glyphicons-halflings-regular.ttf", "fonts/glyphicons-halflings-regular.woff",
	"fonts/glyphicons-halflings-regular.woff2", "favicon.ico"]
	for f in files:
		s3.Object(S3_BUCKET_NAME, f).put(Body=open("no8am/static/" + f, 'rb'))

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
