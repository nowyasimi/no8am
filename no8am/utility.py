# -*- coding: utf-8 -*-

from datetime import datetime
import json
import sys
import requests
from bs4 import BeautifulSoup

from no8am import DEPARTMENT_LIST, CCC_LIST, get_current_term, get_all_courses

BUCKNELL_COURSE_DESCRIPTIONS_URL = "https://ssb-prod.ec.bucknell.edu/PROD/bwckctlg.p_display_courses"

COURSE_DESCRIPTION_FILENAME = "bucknellCourseDescriptions.json"

DEPARTMENTS = None


def is_valid_department(dept):
        """
        Checks whether a department is in the list of valid department codes.

        :param dept: department code
        :return: True if dept is a valid department
        """
        for dept_dic in DEPARTMENT_LIST:
                if dept_dic["abbreviation"] == dept:
                        return True
        return False


def is_valid_ccc_req(req):
        """
        Checks whether a requirement code is in the list of valid CCC
        requirements.

        :param req: CCC requirement code
        :return: True if req is a valid CCC requirement
        """
        for req_dic in CCC_LIST:
                if req_dic["abbreviation"] == req:
                        return True
        return False


def get_course_numbers_in_department(department_name):
	"""
	Gets course numbers in a department for the current term. This is used to filter out descriptions for
	courses not being offered in the current term. Will use cache if cache is enabled.

	:param department_name: A department such as CSCI or ECON
	:return: A list of course numbers in the department
	"""

	from no8am.scraper import Department

	try:
		cache_time, all_courses = Department.process_department_request(department_name)
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

	# TODO - use scraper
	term = get_current_term()["CodeBanner"]

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

	courses = get_all_courses()

	return [x["Subj"] + " " + x["Number"] for x in courses]


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
