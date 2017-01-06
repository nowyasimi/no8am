# -*- coding: utf-8 -*-

from datetime import datetime
import json
import sys
import requests
from bs4 import BeautifulSoup

from no8am import DEPARTMENT_LIST

BUCKNELL_COURSE_DESCRIPTIONS_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/bwckctlg.p_display_courses"

COURSE_DESCRIPTION_FILENAME = "bucknellCourseDescriptions.json"

DEPARTMENTS = None


def get_bucknell_format_semester():
	"""
	Uses the current date to determine which semester of course date to scrape from Bucknell servers.
	Course data for the Fall semester is scraped between 3/1 and 9/15, and the Spring semester between 9/15 and 3/1.

	For the 2016-2017 school year, fall course selection be formatted as '201701', and spring as '201705'.

	:return: A string representing the current semester to scrape from Bucknell servers
	"""

	date = datetime.today()

	# Bucknell-defined course selection year (eg for 2016-2017 year, course selection year is 2017)
	course_selection_year = date.year + 1 if date.month >= 3 else date.year

	# Create date objects for the start of course selection in the current academic year
	start_spring_semester = datetime(course_selection_year - 1, 9, 15)
	start_fall_semester = datetime(date.year, 3, 1)

	# Create a string for the Fall or Spring semester
	if start_fall_semester <= date < start_spring_semester:
		return str(course_selection_year) + '01'
	else:
		return str(course_selection_year) + '05'


def get_user_format_semester():
	"""
	Converts the Bucknell-format semester string to a user-friendly representation.

	:return: A string representing the current semester like 'Fall 2016-2017'
	"""

	bucknell_format = get_bucknell_format_semester()

	bucknell_format_year, bucknell_format_semester = int(bucknell_format[:4]), bucknell_format[4:]

	user_format_semester = 'Fall' if bucknell_format_semester == '01' else 'Spring'

	return "{0} {1}-{2}".format(user_format_semester, bucknell_format_year - 1, bucknell_format_year)


def get_course_numbers_in_department(department_name):
	"""
	Gets course numbers in a department for the current term. This is used to filter out descriptions for
	courses not being offered in the current term.

	:param department_name: A department such as CSCI or ECON
	:return: A list of course numbers in the department
	"""

	from no8am.scraper import Department

	try:
		all_courses = Department.process_department_request(department_name)
	except:
		return []

	courses_in_department = filter(lambda course: course["deptName"] == department_name, all_courses)

	return map(lambda course: course["deptName"] + " " + course["courseNum"], courses_in_department)


def parseAndCurate():
	"""
	Fetches all course descriptions and filters the descriptions to only include courses currently being offered.

	:return: A list of descriptions for courses being offered in the current term.
	"""

	courseNums = get_all_course_numbers()
	print "doing descriptions...."
	final = []
	rows = get_all_course_descriptions()
	print "retrieved all course descriptions, parsing..."

	for x in range(len(rows)):
		if x % 2 == 0:
			numAndName = str(rows[x].text).strip()
			courseNum = numAndName.split(" - ")[0]
			courseName = numAndName.split(" - ")[1]
			if courseNum not in courseNums:
				continue
			info = rows[x+1].strings
			count = 0
			for x in info:
				if count == 0:
					count += 1
				elif count == 1:
					realInfo = x.strip().replace("\n", " ")
					break
			final.append({
				'courseNum': courseNum,
				'courseName': courseName,
				'info': realInfo
			})

	return final


def get_all_course_descriptions():
	"""
	Gets course descriptions for courses across all departments. May include descriptions for courses not currently
	being offered.

	:return: A list of course descriptions
	"""

	term = get_bucknell_format_semester()

	payload = [
		("term_in", term),
		("call_proc_in", "bwckctlg.p_disp_dyn_ctlg"),
		("sel_subj", "dummy"),
		("sel_levl", "dummy"),
		("sel_schd", "dummy"),
		("sel_coll", "dummy"),
		("sel_divs", "dummy"),
		("sel_dept", "dummy"),
		("sel_attr", "dummy")
	]

	# add each department to bucknell server request
	for x in DEPARTMENTS:
		payload.append(("sel_subj", x))

	# return rows of course descriptions from table
	r = requests.get(BUCKNELL_COURSE_DESCRIPTIONS_URL, params=payload)
	soup = BeautifulSoup(r.text)
	table = soup.find_all("table")[3]
	rows = table.find_all("tr")

	return rows


def get_all_course_numbers():
	"""
	Gets course numbers for courses being offered in the current term across all departments.

	:return: A list of course numbers
	"""

	courseNums = []
	print "Getting course nums..."
	# TODO - parallelize this to guarantee completion within 5 minute AWS Lambda execution limit
	for x in DEPARTMENTS:
		print x
		courseNums += get_course_numbers_in_department(x)
	return courseNums


def generate_course_descriptions():
	"""
	Creates a list of departments and fetches course descriptions for all departments

	:return: A list of course descriptions
	"""

	reload(sys)
	sys.setdefaultencoding('utf-8')

	global DEPARTMENTS

	DEPARTMENTS = [x["abbreviation"] for x in DEPARTMENT_LIST]

	return parseAndCurate()


# updates the local course description file for testing

# if __name__ == "__main__":
# 	import io
# 	descriptions = generate_course_descriptions()
# 	descriptions_string = json.dumps(descriptions, ensure_ascii=False)
#
# 	with io.open(COURSE_DESCRIPTION_FILENAME, "w", encoding='utf8') as f:
# 		f.write(descriptions_string)
