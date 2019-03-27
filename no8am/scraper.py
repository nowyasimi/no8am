import requests
from bs4 import BeautifulSoup
import re
from itertools import groupby
import string
from enum import Enum
from no8am import course_data_get, course_data_set

message_regex = re.compile("([ -])([0-9]{2})([ ,.]|$)")
section_range_regex = re.compile(" ([0-9]{2})-([0-9]{2})")
courseNumFull_regex = re.compile("[A-Z]+ [0-9]{3}[A-Z]* [0-9]+")

BUCKNELL_COURSE_DATA_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/hwzkschd.P_Bucknell_SchedDisplay"
BUCKNELL_SECTION_DETAILS_URL = "https://ssb-prod.ec.bucknell.edu/PROD/hwzkdpac.P_Bucknell_CGUpdate"
BUCKNELL_PUB_APPS_URL = "https://pubapps.bucknell.edu/CourseInformation"
BUCKNELL_TERM_URL = BUCKNELL_PUB_APPS_URL + "/data/term"
BUCKNELL_COURSE_DATA_URL_PREFIX = BUCKNELL_PUB_APPS_URL + "/data/course/term/"

# Types of extra sections L (lab), R (recitation), P (problem session)
EXTRA_SECTIONS = "LRP"


def get_current_term():
	# TODO - cache this
    terms = requests.get(BUCKNELL_TERM_URL, verify=False).json()
    return next(term for term in terms if term["Default"] == "Y")

def get_all_courses():
    url = BUCKNELL_COURSE_DATA_URL_PREFIX + get_current_term()["CodeBanner"]
    return requests.get(url, verify=False).json()

def fetch_section_details(crn, department):
	"""
	Fetches description and other data for an individual section.

	:param crn: CRN of the section
	:param department: Department the section belongs to
	:return: Section details
	"""

	# return cached data, if it exists
	key = crn + "details"
	details = course_data_get(key)

	if details is not None:
		return details["set_time"], details["data"]

	term = get_current_term()["CodeBanner"]

	# Create and execute server request
	payload = {
		'formopt': 'VIEWSECT',
		'term': term,
		'updsubj': department,
		'crn': crn,
		'viewterm': term,
	}

	r = requests.get(BUCKNELL_SECTION_DETAILS_URL, params=payload)

	# Create object that will allow parsing of HTML
	soup = BeautifulSoup(r.text)

	# Extract section details
	details = str(soup.find_all(class_='datadisplaytable')[0])

	# store details in cache
	cache_time = course_data_set(key, details, timeout=259200)

	return cache_time, details


def extract_sections(html):
	"""
	Helper function that creates a Beautiful Soup object from the course data and groups sections.

	:param html: Raw HTML of the course data
	:return: A list containing a Beautiful Soup objects for each section
	"""

	# Create object that will allow parsing of HTML
	soup = BeautifulSoup(html.replace("\n", ""))

	# Find table containing section data
	course_tables = soup.find_all(id="coursetable")

	if len(course_tables) == 0:
		raise RuntimeError("No sections found")
	else:
		table_sections = soup.find_all(id="coursetable")[0]

	# Create a list of sections
	sections = table_sections.find_all("tr")[1:]

	return sections


class Section(object):
	"""
	Stores data for an individual section.
	"""

	def __init__(self, section, message=None):
		"""
		Parses JSON for an individual section and stores extra sections (labs, etc) if it
		is a main section.

		:param section: Section JSON
		:param message: Message containing restrictions and other information for the section
		"""

		self.department = section["Subj"]				  											# DEPT
		self.course_number = section["Number"]								 						# 	   000X
		self.sectionNum = section["Section"] 														# 			00
		self.courseNum = self.department + " " + self.course_number + " " + self.sectionNum 		# DEPT 000X 00
		self.bare_course_number = self.department + " " + self.course_number.rstrip(string.letters)	# DEPT 000

		self.CRN = section["Crn"]
		self.courseName = section["Title"]
		self.timesMet = section["Meetings"]
		self.professor = section["Instructors"]
		self.CCC = [x["Code"] for x in section["Reqs"]]

		self.message = section["Footnote"]
		self.main = False 	# assume section is not main

		# to be used if main section
		self.extra_section_lists = {"L": {}, "R": {}, "P": {}}
		self.extra_section_independent = {"L": True, "R": True, "P": True}

	def export(self):
		"""
		Generates section data for main sections or extra sections.

		:return: A dictionary of relevant section data
		"""

		# replace extra section objects with dictionaries
		for extra_section_type, extra_section_list in self.extra_section_lists.iteritems():
			for crn, extra_section in extra_section_list.iteritems():
				if type(extra_section) is not dict:
					export_extra_section = extra_section.__dict__
					if 'extra_section_lists' in export_extra_section.keys():
						del export_extra_section['extra_section_lists']
						del export_extra_section['extra_section_independent']
					extra_section_list[crn] = export_extra_section

		return self.__dict__


class Course:
	"""
	Parses course data by dividing into sections and grouping sections together.
	"""

	def __init__(self, sections, set_to_main=False):
		self.all_sections = sections
		# sections is actually a single extra section if set_to_main
		self.main_sections = {} if not set_to_main else {sections.CRN: sections}
		self.extra_sections = {
			"L": {}, "R": {}, "P": {}
		}
		self.extra_section_numbers = {
			"L": {}, "R": {}, "P": {}
		}

		if not set_to_main:
			self.divide_into_section_types()
			self.link_extra_sections_to_main_sections()

	def divide_into_section_types(self):
		"""
		Identifies the type of each section (main, lab, etc) and stores relevant data in the
		object for further parsing.
		"""

		# The number of characters in a main course number (203, not 203L)
		MAIN_COURSE_NUMBER_LENGTH = 3

		for index, section in enumerate(self.all_sections):
			crn = section.CRN
			section_number = section.sectionNum
			course_number = section.course_number

			if len(course_number) > MAIN_COURSE_NUMBER_LENGTH and course_number[-1] in EXTRA_SECTIONS:
				section.main = False
				extra_section_type = EXTRA_SECTIONS[EXTRA_SECTIONS.index(course_number[-1])]

				# remove message from extra section
				self.extra_sections[extra_section_type][crn] = section
				self.extra_section_numbers[extra_section_type][section_number] = crn
			else:
				section.main = True
				self.main_sections[crn] = section

	def link_extra_sections_to_main_sections(self):
		"""
		Groups extra sections (labs, recitations, etc) to the main sections of the course.
		"""

		for index, section in enumerate(self.all_sections):
			message = section.message

			# Makes sure section is DEPT 101 00, not DEPT 101R 00 or DEPT 101L 00
			if message is None or not section.main:
				continue

			# find ranges of sections like "labs 60-69"
			legal_sections = [x[1] for x in re.findall(message_regex, message)]
			for x in re.findall(section_range_regex, message):
				# convert range of sections to list and convert to string
				legal_sections += [str(y) for y in range(int(x[0]), int(x[1]) + 1)]

			# remove duplicates
			legal_sections = list(set(legal_sections))

			# checks if section has been linked to a recitation using number of lab sections in pre-collected list
			has_extra_section = {
				x: len(self.extra_section_numbers[x]) > 0 for x in self.extra_section_numbers
			}

			# now it's time to see what the sections correspond to
			for legalSection in legal_sections:
				for extra_section_type in EXTRA_SECTIONS:
					# found match, now merge
					if legalSection in self.extra_section_numbers[extra_section_type]:
						extra_section_crn = self.extra_section_numbers[extra_section_type][legalSection]
						extra_section = self.extra_sections[extra_section_type][extra_section_crn]
						section.extra_section_lists[extra_section_type][extra_section_crn] = extra_section
						has_extra_section[extra_section_type] = False

			for extra_section_type in EXTRA_SECTIONS:
				extra_sections = [x for x in legal_sections if x in self.extra_section_numbers[extra_section_type]]

				if len(self.extra_section_numbers[extra_section_type]) > len(extra_sections) > 0:
					section.extra_section_independent[extra_section_type] = False

			# if message didn't link section to a specific extra section
			for extra_section_type in has_extra_section:
				if has_extra_section[extra_section_type]:
					section.extra_section_lists[extra_section_type] = self.extra_sections[extra_section_type]

		# if extra sections exist and a main isn't tied to any
		for extra_section_type in self.extra_sections:
			for crn, section in self.main_sections.iteritems():
				if len(section.extra_section_lists[extra_section_type]) == 0:
					section.extra_section_lists[extra_section_type] = self.extra_sections[extra_section_type]

	def export(self):
		"""
		Exports the course object.

		:return: A dictionary of course data that can be read by the client
		"""

		if len(self.main_sections) == 0:
			return None

		return {
			"sections": {crn: self.main_sections[crn].export() for crn in self.main_sections},
			"deptName": self.main_sections[self.main_sections.keys()[0]].department,
			"courseNum": self.main_sections[self.main_sections.keys()[0]].course_number
		}

def filter_sections_by_type(sections, lookup_type, lookup_val):
	# TODO - sort
	if lookup_type == "ccc":
		return [x for x in sections if lookup_val in [y["Code"] for y in x["Reqs"]]]
	elif lookup_type == "credit":
		# TODO - also use CreditMax
		return [x for x in sections if x["Credit"] == lookup_val]
	else:
		return [x for x in sections if lookup_val in x["DeptCodes"]]

class CreditOrCCC:
	"""
	Groups together static methods that are used to process CCC or credit requests.
	"""

	@staticmethod
	def process_ccc_or_credit_request(lookup_type, lookup_value):
		"""
		Fetches course data table in HTML, extracts sections, and generates list of courses.

		:param lookup_type: Type of data being requested (CCC requirement or credit level)
		:param lookup_value: Value of data requested (W1, EGSS, half credit, etc.)
		:return: List of parsed course data
		"""

		# return cached data, if it exists
		cache_data = course_data_get(lookup_value)

		if cache_data is not None:
			return cache_data["set_time"], cache_data["data"]

		# fetch the course data
		sections = filter_sections_by_type(get_all_courses(), lookup_type, lookup_value)

		# generate a list of dictionaries to organize data for each section
		all_courses = map(CreditOrCCC.handle_ccc_or_credit_section, sections)

		# store in cache and return data
		cache_time = course_data_set(lookup_value, all_courses)

		return cache_time, all_courses

	@staticmethod
	def handle_ccc_or_credit_section(section):
		"""
		Parse the data for an individual section by treating it like an entire course.

		:param section: A Beautiful Soup object for one section
		:return: A course object for that section
		"""

		return Course(Section(section), True).export()

class Department:
	"""
	Groups together static methods that are used to process department requests.
	"""

	@staticmethod
	def process_department_request(department_name):
		"""
		Fetches course data table in HTML, extracts sections, and generates list of courses.

		:param department_name: The department being requested (CSCI, ECON, etc)
		:return: List of parsed course data
		"""

		# return cached data, if it exists
		cache_data = course_data_get(department_name)

		if cache_data is not None:
			return cache_data["set_time"], cache_data["data"]

		# fetch the sections
		sections = filter_sections_by_type(get_all_courses(), None, department_name)

		# group sections by course
		grouped_sections = Department.group_sections_by_course(sections)

		# parse courses to group sections with their labs, recitations, etc.
		parsed_courses = map(Course, grouped_sections)

		# create format that can be stored in cache or returned to user
		formatted_results = [course.export() for course in parsed_courses if course.export() is not None]

		cache_time = course_data_set(department_name, formatted_results)

		return cache_time, formatted_results

	@staticmethod
	def group_sections_by_course(sections):
		sorted_sections = sorted([Section(x) for x in sections], key=lambda x: x.courseNum)
		return [list(group) for key, group in groupby(sorted_sections, lambda x: x.bare_course_number)]


def find_course_in_department(parsed_data, department_name, course_number):
	"""
	Finds a course within a department.

	:param parsed_data: A list of courses within a department
	:param department_name: The department being search for
	:param course_number: The course number being searched for
	:return: The sections of the course being searched for
	"""

	for course in parsed_data:
		if course["courseNum"] == course_number and course["deptName"] == department_name:
			return course["sections"]
