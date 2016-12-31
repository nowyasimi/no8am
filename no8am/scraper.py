import requests
from bs4 import BeautifulSoup
import re
from itertools import groupby
import string
from no8am import get_bucknell_format_semester
from enum import Enum

TERM = get_bucknell_format_semester()
message_regex = re.compile("([ -])([0-9]{2})([ ,.]|$)")
section_range_regex = re.compile(" ([0-9]{2})-([0-9]{2})")
courseNumFull_regex = re.compile("[A-Z]+ [0-9]{3}[A-Z]* [0-9]+")

BUCKNELL_COURSE_DATA_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/hwzkschd.P_Bucknell_SchedDisplay"
BUCKNELL_SECTION_DETAILS_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/hwzkdpac.P_Bucknell_CGUpdate"


class LookupType(Enum):
	DEPARTMENT = 'DPT'
	CCC = 'REQ2'
	CREDIT = 'CRD'


def fetch_course_html(payload_value, lookup_type):
	"""
	Helper function for retrieving course data from Bucknell servers.

	:param payload_value: The data being requested in a category
	:param lookup_type: The category of data being requested
	:return: Sections as raw HTML
	"""

	payload = {
		'term': TERM,
		'param1': payload_value,
		'lookopt': lookup_type.value,
		'openopt': 'ALL'
	}

	r = requests.get(BUCKNELL_COURSE_DATA_URL, params=payload)
	return r.text


def fetch_section_details(crn, dept):
	"""
	Fetches description and other data for an individual section.

	:param crn: CRN of the section
	:param dept: Department the section belongs to
	:return: Section details
	"""

	# Create and execute server request
	payload = {
		'formopt': 'VIEWSECT',
		'term': TERM,
		'updsubj': dept,
		'crn': crn,
		'viewterm': TERM,
		'viewlookopt': 'DPT',
		'viewparam1': dept,
		'viewopenopt': 'ALL',
	}

	r = requests.get(BUCKNELL_SECTION_DETAILS_URL, params=payload)

	# Create object that will allow parsing of HTML
	soup = BeautifulSoup(r.text)

	# Extract section details
	details = str(soup.find_all(class_='datadisplaytable')[0])

	return details


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


# TODO - inherit from object so __dict__ can be used for export
class Section:
	def __init__(self, section, message=None):
		course_number_with_section = str(''.join(section[1].strings))
		bare_course_number = " ".join(course_number_with_section.split(" ")[:2]).rstrip(string.letters)
		department, course_number, section_number = course_number_with_section.split(" ")

		self.bare_course_number = bare_course_number 	    # DEPT 000
		self.courseNum = course_number_with_section  	    # DEPT 000X 00
		self.department = department  					    # DEPT
		self.course_number = course_number  			    # 	   000X
		self.sectionNum = section_number  				    # 			00
		self.courseName = str(''.join(section[2].strings))
		self.timesMet = str(''.join(section[3].strings))
		self.roomMet = str(', '.join(section[4].strings))
		self.professor = str('; '.join(section[5].strings))
		self.freeSeats = str(''.join(section[6].strings).replace(u'\xa0', " "))
		self.waitList = str(''.join(section[7].strings))
		self.resSeats = str(''.join(section[8].strings))
		self.prm = str(''.join(section[9].strings))
		self.CCC = str(''.join(section[10].strings)).strip()
		self.CRN = str(section[0].string)
		self.message = str(''.join(message[0].strings).replace(u'\u2019', "")) if message is not None else None
		self.main = False 	# assume section is not main

		# to be used if main section
		self.extra_section_lists = {"L": {}, "R": {}, "P": {}}
		self.extra_section_independent = {"L": True, "R": True, "P": True}

	def export(self):
		"""
		Generates section data for main sections or extra sections.

		:return: A dictionary of relevant section data
		"""

		export_data = {
			"bare_course_number": self.bare_course_number,
			"courseNum": self.courseNum,
			"department": self.department,
			"course_number": self.course_number,
			"sectionNum": self.sectionNum,
			"courseName": self.courseName,
			"timesMet": self.timesMet,
			"roomMet": self.roomMet,
			"professor": self.professor,
			"freeSeats": self.freeSeats,
			"waitList": self.waitList,
			"resSeats": self.resSeats,
			"prm": self.prm,
			"CCC": self.CCC,
			"CRN": self.CRN,
			"message": self.message,
			"main": self.main
		}

		if self.main:
			export_data["extra_section_lists"] = {section_type: {x: self.extra_section_lists[section_type][x].export() for x in self.extra_section_lists[section_type]} for section_type in self.extra_section_lists}
			export_data["extra_section_independent"] = self.extra_section_independent

		return export_data


class Course:
	def __init__(self, sections, set_to_main = False):
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
		# Types of extra sections L (lab), R (recitation), P (problem session)
		EXTRA_SECTIONS = "LRP"

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
		EXTRA_SECTIONS = "LRP"

		for index, section in enumerate(self.all_sections):
			message = section.message
			# TODO - see if the regex can be replaced by course_number (or remove course_number)
			course_number = section.course_number

			# Makes sure section is DEPT 101 00, not DEPT 101R 00 or DEPT 101L 00
			if message is None or len(re.findall(courseNumFull_regex, message)) == 0 or not section.main:
				continue

			message_text = message.split(': ')[1].lower()

			# find ranges of sections like "labs 60-69"
			legal_sections = [x[1] for x in re.findall(message_regex, message_text)]
			for x in re.findall(section_range_regex, message_text):
				# convert range of sections to list and convert to string
				legal_sections += [str(y) for y in range(int(x[0]), int(x[1]) + 1)]

			# remove duplicates
			legal_sections = list(set(legal_sections))

			# checks if section has been linked to a recitation using number of lab sections in pre-collected list
			has_extra_section = {
				"R": len(self.extra_section_numbers["R"]) > 0,
				"L": len(self.extra_section_numbers["L"]) > 0,
				"P": len(self.extra_section_numbers["P"]) > 0
			}

			# now it's time to see what the sections correspond to
			for legalSection in legal_sections:
				for extra_section_type in EXTRA_SECTIONS:
					# found match, now merge
					if legalSection in self.extra_section_numbers[extra_section_type]:
						extra_section_crn = self.extra_section_numbers[extra_section_type][legalSection]

						# valid labs have been matched
						section.extra_section_lists[extra_section_type][extra_section_crn] = self.extra_sections[extra_section_type][extra_section_crn]
						has_extra_section[extra_section_type] = False

			if len(self.extra_section_numbers["L"]) > len([x for x in legal_sections if x in self.extra_section_numbers["L"]]) > 0:
				section.extra_section_independent["L"] = False
			if len(self.extra_section_numbers["R"]) > len([x for x in legal_sections if x in self.extra_section_numbers["R"]]) > 0:
				section.extra_section_independent["R"] = False
			if len(self.extra_section_numbers["P"]) > len([x for x in legal_sections if x in self.extra_section_numbers["P"]]) > 0:
				section.extra_section_independent["P"] = False

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

		return {
			"sections": {crn: self.main_sections[crn].export() for crn in self.main_sections},
			"deptName": self.main_sections[self.main_sections.keys()[0]].department,
			"courseNum": self.main_sections[self.main_sections.keys()[0]].course_number
		}


class CreditOrCCC:

	@staticmethod
	def process_ccc_or_credit_request(lookup_type, lookup_value):
		"""
		Fetches course data table in HTML, extracts sections, and generates list of courses.

		:param lookup_type: Type of data being requested (CCC requirement or credit level)
		:param lookup_value: Value of data requested (W1, EGSS, half credit, etc.)
		:return: List of parsed course data
		"""

		# fetch the HTML
		lookup_type_enum = LookupType[lookup_type.upper()]
		html = fetch_course_html(lookup_value, lookup_type_enum)

		# extract section data from html
		sections = extract_sections(html)

		# ignore elements that don't contain course data
		filtered_sections = filter(lambda x: len(x) > 5, sections)

		# generate a list of dictionaries to organize data for each section
		return map(CreditOrCCC.handle_ccc_or_credit_section, filtered_sections)

	@staticmethod
	def handle_ccc_or_credit_section(section):
		"""
		Parse the data for an individual section by treating it like an entire course.

		:param section: A Beautiful Soup object for one section
		:return: A course object for that section
		"""

		# divide a row of section data into its individual columns
		data = section.find_all("td")

		section = Section(data)

		course = Course(section, True)

		return course.export()


class Department:

	@staticmethod
	def process_department_request(department_name):
		"""

		:param department_name:
		:return:
		"""

		# fetch the HTML
		html = fetch_course_html(department_name, LookupType.DEPARTMENT)

		# extract sections from HTML
		sections = extract_sections(html)

		# ignore first row of section data if it is a department message
		sections = sections[1:] if len(sections[0].find_all("td")) == 1 else sections

		# divide a row of section data into its individual columns
		section_split = map(lambda current_section: current_section.find_all("td"), sections)

		# group sections by course
		grouped_sections = Department.group_sections_by_course(section_split)

		# parse courses to group sections with their labs, recitations, etc.
		parsed_courses = map(Course, grouped_sections)

		# return formatted results
		return [course.export() for course in parsed_courses]

	@staticmethod
	def group_sections_by_course(sections):
		sections_with_message = []
		grouped_sections = []

		# group section with its message, if it has one
		for index, section in enumerate(sections):
			if len(section) == 1:
				continue

			message = sections[index + 1] if index < len(sections) - 1 and len(sections[index + 1]) == 1 else None
			sections_with_message.append(Section(section, message))

		# group sections by course
		for key, group in groupby(sections_with_message, lambda x: x.bare_course_number):
			grouped_sections.append(list(group))

		return grouped_sections


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
