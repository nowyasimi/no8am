from rjsmin import jsmin
from rcssmin import cssmin
import boto3
import time
import os
import json
from no8am import generate_course_descriptions, DEPARTMENT_LIST, CCC_LIST, CREDIT_LIST


CLOUDFRONT_DISTRIBUTION_ID = os.environ.get("CLOUDFRONT_DISTRIBUTION_ID")
S3_BUCKET_NAME = "no8.am"
STATIC_LOCATION = os.environ.get('STATIC_LOCATION') or "local"

# TODO - get bucknell data from metadata file
jsBucknell = ['js/jquery-1.9.1.min.js', 'js/bootstrap.min.js', 'js/typeahead.bundle.min.js', 'js/handlebars-v1.3.0.js',
			  'js/Constants.js', 'js/Section.js', 'js/Course.js', 'js/Department.js', 'js/Schedule.js', 'js/base.js']
jsHome = ['js/jquery-1.9.1.min.js', 'js/bootstrap.min.js']
jsHome2 = ['js/typeahead.bundle.min.js', 'js/handlebars-v1.3.0.js', 'bucknellCourseDescriptions.json']

MINIFY_JS_FILE_NAMES = ['packed.js', 'packed2.js', 'packed3.js']

course_descriptions = None


def generate_metadata():
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


def minify_javascript(file_list):
	"""
	Runs files through JavaScript minification program.

	:param file_list: Files to minify
	:return: Minified files bundled together in one string.
	"""

	global course_descriptions

	strings_to_minify = [generate_metadata()]

	for file_name in file_list:
		with open("no8am/static/" + file_name, 'r') as f:
			contents = f.read()
		strings_to_minify.append(contents)

	return "".join([jsmin(x) + ";" for x in strings_to_minify])


def minify_css(file_list):
	"""
	Runs files through CSS minification program.

	:param file_list: Files to minify
	:return: Minified files bundled together in one string.
	"""

	minified = ""
	for file_name in file_list:
		with open("no8am/static/" + file_name, 'r') as f:
			contents = f.read()
		minified += cssmin(contents)
	return minified


def map_minify_name_to_files(page):
	"""
	Defines groups of files that can be minified.

	:param page: Name of group of files to minify.
	:return: Minifed files
	"""

	if page == "packed3.js":
		return minify_javascript(jsBucknell)
	elif page == "packed.js":
		return minify_javascript(jsHome)
	elif page == "packed2.js":
		return minify_javascript(jsHome2)
	elif page == "home.css":
		return minify_css(["css/bootstrap.min.css", "css/home.css"])
	elif page == "bucknell.css":
		return minify_css(["css/bootstrap.min.css", "css/calendar.css"])

	print "invalid page"


def update_static_files():
	"""
	Minifies and pushes static assets to Amazon Cloudfront.
	"""

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
	to_minify = MINIFY_JS_FILE_NAMES
	for m in to_minify:
		data = map_minify_name_to_files(m)
		s3.Object(S3_BUCKET_NAME, m).put(Body=data, ContentType ='application/javascript', CacheControl='max-age=900')

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
