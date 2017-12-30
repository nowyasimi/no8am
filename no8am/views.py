from flask import render_template, request, jsonify, redirect, url_for, session
import requests
import sys
import httplib
from functools import wraps
import json

from no8am import app, store_link, get_link, generate_short_link, fetch_section_details, get_user_format_semester, generate_metadata, \
	CCC_LIST, CREDIT_LIST, DEPARTMENT_LIST, APPLICATION_ROOT, STATIC_LOCATION, SIMPLE_FORM_TOKEN, \
	get_course_information

reload(sys)
sys.setdefaultencoding('utf-8')


def handle_response_errors(api_arguments):
	"""
	Decorator to return the correct HTTP errors in API responses.
	"""

	def handle_response_errors_decorator(api_function):

		@wraps(api_function)
		def wrapper():
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
	return render_template('index.html', APP_ROOT=APPLICATION_ROOT)


@app.route('/bucknell/')
@app.route('/bucknell/<config>')
def bucknell(config=None):
	if config:
		# Verify that custom link is valid
		response = get_link(config)
		if "Item" in response.keys():
			# store course data in cookie and redirect to /bucknell/
			session['saved_schedule'] = response["Item"]["schedule"]["S"]
		return redirect(url_for('bucknell'))
	else:
		return render_template(
			'start.html',
			CURRENT_SEMESTER=get_user_format_semester(),
			APP_ROOT=APPLICATION_ROOT
		)


@app.route('/course')
@app.route('/course/<department>')
@app.route('/course/<department>/<course_number>')
def course_lookup(department=None, course_number=None):

	return jsonify(sections=get_course_information())

	# return metadata if no parameters are provided
	if department is None and course_number is None:
		return jsonify(departments=DEPARTMENT_LIST)

	# TODO - validate department against metadata
	department = department.upper()

	cache_time, department_data = Department.process_department_request(department)

	# return all courses in department
	if course_number is None:
		return jsonify(sections=department_data, cache_time=cache_time)

	# return data on specified course
	else:
		sections = find_course_in_department(department_data, department, course_number)
		return jsonify(sections=sections, cache_time=cache_time)


@app.route('/category')
@app.route('/category/<category>')
@app.route('/category/<category>/<lookup_val>')
def other_lookup(category=None, lookup_val=None):

	# provide category options if a category is not specified
	if category is None:
		return jsonify(category=['ccc','credit'])

	category = category.lower()

	# provide metadata if lookup value is not specified
	if category == 'ccc' and lookup_val is None:
		return jsonify(ccc=CCC_LIST)

	elif category == 'credit' and lookup_val is None:
		return jsonify(credit=CREDIT_LIST)

	# provide course data
	elif category in ['ccc', 'credit'] and lookup_val is not None:
		# TODO - validate lookup_val against metadata
		lookup_val = lookup_val.upper()
		cache_time, all_sections = CreditOrCCC.process_ccc_or_credit_request(category, lookup_val)
		return jsonify(sections=all_sections, cache_time=cache_time)

	# invalid lookup type
	else:
		return jsonify(error="Category should be either 'ccc' or 'credit'"), httplib.BAD_REQUEST


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
@handle_response_errors(['errorDescription', 'name', 'email', 'useragent', 'schedule'])
def report_error(error_description, name, email, useragent, schedule):
	ip = request.remote_addr

	payload = {
		'error_description': error_description,
		'name': name,
		'email': email,
		'useragent': useragent,
		'ip': ip,
		'schedule': schedule,
		'form_api_token': SIMPLE_FORM_TOKEN
	}

	requests.post("http://getsimpleform.com/messages", data=payload)
	return '', httplib.NO_CONTENT


@app.errorhandler(httplib.NOT_FOUND)
def page_not_found(error):
	return render_template('404.html', APP_ROOT=APPLICATION_ROOT), httplib.NOT_FOUND
