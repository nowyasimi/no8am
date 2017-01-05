from flask import render_template, request, jsonify, redirect, url_for, session
import requests
import sys
import os
import httplib
from functools import wraps
import json

from no8am import app, store_link, get_link, generate_short_link, JS_FILES, Department, CreditOrCCC, \
	find_course_in_department, fetch_section_details, get_user_format_semester, generate_metadata

reload(sys)
sys.setdefaultencoding('utf-8')

APPLICATION_ROOT = os.environ.get('APPLICATION_ROOT') or ""
STATIC_LOCATION = os.environ.get('STATIC_LOCATION') or "local"

SIMPLE_FORM_TOKEN = os.environ.get("SIMPLE_FORM_TOKEN")


def handle_response_errors(api_arguments):
	"""
	Decorator to return the correct HTTP errors in API responses.
	"""

	def handle_response_errors_decorator(api_function):

		@wraps(api_function)
		def wrapper():
			# TODO - also validate departments, CCC, and other inputs server side using metadata file

			# find arguments missing from API call
			missing_arguments = set(api_arguments) - set(request.args.keys())

			try:
				# find missing arguments
				if len(missing_arguments) > 0:
					raise RuntimeError("Missing the following arguments: " + str(list(missing_arguments)))

				# retrieve argument values and pass them to the API function
				return api_function(*map(request.args.get, api_arguments))

			except RuntimeError as error:
				# let the user know about a malformed API call
				return jsonify(error=error.message), httplib.BAD_REQUEST

			except Exception:
				return '', httplib.BAD_REQUEST

		return wrapper

	return handle_response_errors_decorator


@app.route('/')
def index():
	return render_template(
		'index.html', ASSET_URL="app.js", APP_ROOT=APPLICATION_ROOT, jsFiles=JS_FILES, STATIC_LOCATION=STATIC_LOCATION
	)


@app.route('/bucknell/')
@app.route('/bucknell/<config>')
def bucknell(config=None):
	if config:
		# Verify that custom link is valid
		response = get_link(config)
		if "Item" in response.keys():
			# store course data in cookie and redirect to /bucknell/
			session['custom_data'] = response["Item"]["schedule"]["S"]
		return redirect(url_for('bucknell'))
	else:
		custom_data = json.loads(session.pop('custom_data', 'null'))
		metadata = generate_metadata() if STATIC_LOCATION == 'local' else None
		return render_template(
			'start.html', customData=custom_data, ASSET_URL="app.js", CURRENT_SEMESTER=get_user_format_semester(),
			APP_ROOT=APPLICATION_ROOT, STATIC_LOCATION=STATIC_LOCATION, jsFiles=JS_FILES, metadata=metadata
		)


@app.route('/lookup/')
@handle_response_errors(['department', 'course_number'])
def course_lookup(department, course_number):
	cache_time, department_data = Department.process_department_request(department)
	course_data = find_course_in_department(department_data, department, course_number)
	return jsonify(sections = course_data, cache_time = cache_time)


@app.route('/deptlookup/')
@handle_response_errors(['department'])
def department_lookup(department):
	cache_time, department_data = Department.process_department_request(department)
	return jsonify(courses = department_data, cache_time = cache_time)


@app.route('/otherlookup/')
@handle_response_errors(['type', 'val'])
def other_lookup(lookup_type, val):
	cache_time, all_courses = CreditOrCCC.process_ccc_or_credit_request(lookup_type, val)
	return jsonify(courses=all_courses, cache_time=cache_time)


@app.route('/sectiondetails/')
@handle_response_errors(['crn', 'department'])
def get_details(crn, department):
	cache_time, section_details = fetch_section_details(crn, department)
	return jsonify(section_details=section_details, cache_time=cache_time)


@app.route('/storeConfig/')
@handle_response_errors(['config'])
def store_course_configuration(config):
	link = generate_short_link()
	store_link(link, config)
	return jsonify(shortLink=link)


@app.route('/reportError/')
@handle_response_errors(['courseNum', 'name', 'email', 'useragent'])
def report_error(courseNum, name, email, useragent):
	ip = request.remote_addr

	payload = {
		'courseNum': courseNum,
		'name': name,
		'email': email,
		'useragent': useragent,
		'ip': ip,
		'form_api_token': SIMPLE_FORM_TOKEN
	}

	requests.post("http://getsimpleform.com/messages", data=payload)
	return '', httplib.NO_CONTENT


@app.errorhandler(httplib.NOT_FOUND)
def page_not_found(error):
	return render_template(
		'404.html', ASSET_URL="packed.js", APP_ROOT=APPLICATION_ROOT, STATIC_LOCATION=STATIC_LOCATION
	), httplib.NOT_FOUND
