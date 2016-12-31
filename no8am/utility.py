from datetime import datetime
import json
import io
import sys
import requests
from bs4 import BeautifulSoup

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


# TODO - make this a cron job and write to S3


def get_course_numbers_in_department(department_name):
	from no8am.scraper import Department

	try:
		all_courses = Department.process_department_request(department_name)
	except:
		return []

	courses_in_department = filter(lambda course: course["deptName"] == department_name, all_courses)

	return map(lambda course: course["deptName"] + " " + course["courseNum"], courses_in_department)


def parseAndCurate():
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
			temp = {}
			temp["courseNum"] = courseNum
			temp["courseName"] = courseName
			temp["info"] = realInfo
			final.append(temp)

	# TODO - add courses that are not in descriptions (without description)
	# might not be necessary, mostly shows crosslisted courses

	# print "adding missing courses"
	# courseNumsWithDescriptions = [x["courseNum"] for x in final]
	# missingCourseNums = [x for x in courseNums if x not in courseNumsWithDescriptions]
	# print "missing courses:"
	# print missingCourseNums
	return final


def get_all_course_descriptions():
	term = get_bucknell_format_semester()

	payload = [("term_in", term), ("call_proc_in","bwckctlg.p_disp_dyn_ctlg"),
	 ("sel_subj","dummy"), ("sel_levl","dummy"), ("sel_schd","dummy"), ("sel_coll","dummy"),
	 ("sel_divs","dummy"), ("sel_dept","dummy"), ("sel_attr","dummy")]
	for x in DEPARTMENTS:
		payload.append(("sel_subj", x))
	r = requests.get("https://www.bannerssb.bucknell.edu/ERPPRD/bwckctlg.p_display_courses", params=payload)
	soup = BeautifulSoup(r.text)
	table = soup.find_all("table")[3]
	rows = table.find_all("tr")
	return rows


def get_all_course_numbers():
	courseNums = []
	print "Getting course nums..."
	for x in DEPARTMENTS:
		print x
		courseNums += get_course_numbers_in_department(x)
	return courseNums


def generate_course_descriptions():
	reload(sys)
	sys.setdefaultencoding('utf-8')

	from no8am.metadata import DEPARTMENT_LIST

	global DEPARTMENTS

	DEPARTMENTS = [x["short"] for x in DEPARTMENT_LIST]

	return parseAndCurate()


if __name__ == "__main__":
	descriptions = generate_course_descriptions()

	with io.open(COURSE_DESCRIPTION_FILENAME, "w", encoding='utf8') as f:
		f.write("courseDescriptions = [".decode("utf8"))
		for x in range(len(descriptions)):
			data = json.dumps(descriptions[x], ensure_ascii=False).decode('utf8')
			try:
				f.write(data)
			except TypeError:
				# Decode data to Unicode first
				f.write(data.decode('utf8'))
			if x != len(descriptions) - 1:
				f.write(", ".decode("utf8"))
		f.write("]".decode("utf8"))
