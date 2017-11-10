import requests
from bs4 import BeautifulSoup
import re
from itertools import groupby
import string
from enum import Enum
from no8am import get_bucknell_format_semester, course_data_get, course_data_set

TERM = get_bucknell_format_semester()
message_regex = re.compile("([ -])([0-9]{2})([ ,.]|$)")
section_range_regex = re.compile(" ([0-9]{2})-([0-9]{2})")
courseNumFull_regex = re.compile("[A-Z]+ [0-9]{3}[A-Z]* [0-9]+")

BUCKNELL_COURSE_DATA_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/hwzkschd.P_Bucknell_SchedDisplay"
BUCKNELL_SECTION_DETAILS_URL = "https://www.bannerssb.bucknell.edu/ERPPRD/hwzkdpac.P_Bucknell_CGUpdate"

# Types of extra sections L (lab), R (recitation), P (problem session)
EXTRA_SECTIONS = "LRP"

class LookupType(Enum):
	DEPARTMENT = 'department'
	CCC = 'CCC'
	CREDIT = 'credit'

class CreditType(Enum):
	ZERO = '0'
	QUARTER = '.25'
	HALF = '.5'
	FULL = '1'

def fetch_course_html(credit_type):
	"""
	Helper function for retrieving course data from Bucknell servers.

	:param payload_value: The data being requested in a category
	:param lookup_type: The category of data being requested
	:return: Sections as raw HTML
	"""

	CREDIT_LOOKUP = 'CRD'

	payload = {
		'term': TERM,
		'param1': credit_type,
		'lookopt': CREDIT_LOOKUP,
		'openopt': 'ALL'
	}

	r = requests.get(BUCKNELL_COURSE_DATA_URL, params=payload)
	return r.text


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

	# Create and execute server request
	payload = {
		'formopt': 'VIEWSECT',
		'term': TERM,
		'updsubj': department,
		'crn': crn,
		'viewterm': TERM,
		'viewlookopt': 'DPT',
		'viewparam1': department,
		'viewopenopt': 'ALL',
	}

	r = requests.get(BUCKNELL_SECTION_DETAILS_URL, params=payload)

	# Create object that will allow parsing of HTML
	soup = BeautifulSoup(r.text)

	# Extract section details
	details = str(soup.find_all(class_='datadisplaytable')[0])

	# store details in cache
	cache_time = course_data_set(key, details, timeout=259200)

	return cache_time, details


def extract_table_rows(html):
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

	def __init__(self, section, credits, message=None):
		"""
		Parses HTML for an individual section and stores extra sections (labs, etc) if it
		is a main section.

		:param section: Section HTML
		:param message: Message containing restrictions and other information for the section
		"""

		course_number_with_section = str(''.join(section[1].strings))
		bare_course_number = " ".join(course_number_with_section.split(" ")[:2]).rstrip(EXTRA_SECTIONS)
		department, course_number, section_number = course_number_with_section.split(" ")

		self.credits = credits
		self.department = department # DEPT
		self.course = course_number # 000X
		self.sectionNum = section_number # 00
		self.departmentAndCourse = department + " " + course_number # DEPT 000X
		self.departmentAndBareCourse = bare_course_number # DEPT 000
		self.departmentAndCourseAndSection = course_number_with_section # DEPT 000X 00
		self.CRN = str(section[0].string)
		self.courseName = str(''.join(section[2].strings))
		self.timesMet = filter(lambda x: "TBA" not in x, list(section[3].strings))
		self.roomMet = list(section[4].strings)
		self.professor = list(section[5].strings)
		self.freeSeats = str(''.join(section[6].strings).replace(u'\xa0', " "))

		if str(''.join(section[10].strings)) == 'Desc': # Index 10 col is Course Desc
			self.waitList = ""
			self.resSeats = str(''.join(section[7].strings))
			self.prm = str(''.join(section[8].strings))
			self.CCC = str(''.join(section[9].strings)).strip().split()
		else: # Index 10 col is CCC
			self.waitList = str(''.join(section[7].strings))
			self.resSeats = str(''.join(section[8].strings))
			self.prm = str(''.join(section[9].strings))
			self.CCC = str(''.join(section[10].strings)).strip().split()

		self.message = str(''.join(message[0].strings).replace(u'\u2019', "")) if message is not None else None

	def setup_main_section(self):
		self.main = True

	def setup_extra_section(self):
		self.main = False
		self.dependent_main_sections = []

	def export(self):
		"""
		Generates section data for main sections or extra sections.

		:return: A dictionary of relevant section data
		"""

		return self.__dict__


class Course:
	"""
	Parses course data by dividing into sections and grouping sections together.
	"""

	def __init__(self, sections):
		self.all_sections = sorted(sections, key=lambda x: x.sectionNum)
		self.main_sections = {}
		self.extra_sections = {}
		self.extra_section_numbers = {}
		self.departmentAndCourse = sections[0].departmentAndBareCourse if len(sections) > 0 else None

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
			course_number = section.course

			if len(course_number) > MAIN_COURSE_NUMBER_LENGTH and course_number[-1] in EXTRA_SECTIONS:
				section.setup_extra_section()
				extra_section_type = EXTRA_SECTIONS[EXTRA_SECTIONS.index(course_number[-1])]

				if extra_section_type not in self.extra_sections:
					self.extra_sections[extra_section_type] = {}
					self.extra_section_numbers[extra_section_type] = {}

				# remove message from extra section
				self.extra_sections[extra_section_type][crn] = section
				self.extra_section_numbers[extra_section_type][section_number] = crn
			else:
				section.setup_main_section()
				self.main_sections[crn] = section

	def link_extra_sections_to_main_sections(self):
		"""
		Groups extra sections (labs, recitations, etc) to the main sections of the course.
		"""

		for index, section in enumerate(self.all_sections):

			message = section.message

			# Makes sure section is DEPT 101 00, not DEPT 101R 00 or DEPT 101L 00
			if (message is not None and len(re.findall(courseNumFull_regex, message)) == 0) or not section.main:
				continue

			# identify which extra section types exist for this course
			has_extra_section = {
				x: len(self.extra_section_numbers[x]) > 0 for x in self.extra_section_numbers
			}

			if message is not None:

				message_text = message.split(': ')[1].lower()

				# find ranges of sections like "labs 60-69"
				legal_sections = [x[1] for x in re.findall(message_regex, message_text)]
				for x in re.findall(section_range_regex, message_text):
					# convert range of sections to list and convert to string
					legal_sections += [str(y) for y in range(int(x[0]), int(x[1]) + 1)]

				# remove duplicates
				legal_sections = list(set(legal_sections))

				# ignore extra section types that have listed specific section numbers
				for legalSection in legal_sections:
					for extra_section_type in self.extra_sections:
						if legalSection in self.extra_section_numbers[extra_section_type]:
							has_extra_section[extra_section_type] = False

				# group legal sections by extra section type
				for extra_section_type in self.extra_sections:
					extra_sections = [x for x in legal_sections if x in self.extra_section_numbers[extra_section_type]]

					for section_number in extra_sections:
						extra_section_crn = self.extra_section_numbers[extra_section_type][section_number]
						self.extra_sections[extra_section_type][extra_section_crn].dependent_main_sections.append(section.sectionNum)

			# if message didn't link section to a specific extra section, link all extra sections to this one
			for extra_section_type in has_extra_section:
				if has_extra_section[extra_section_type]:
					for section_number in self.extra_section_numbers[extra_section_type]:
						extra_section_crn = self.extra_section_numbers[extra_section_type][section_number]
						self.extra_sections[extra_section_type][extra_section_crn].dependent_main_sections.append(section.sectionNum)

	def export(self):
		"""
		Exports the course object.

		:return: A list of sections that can be read by the client
		"""

		extra_sections = [[section.export() for section in sorted(section_list.values(), key=lambda x:x.sectionNum)] for section_type, section_list in self.extra_sections.iteritems()]

		flattened_extra_sections = [item for sublist in extra_sections for item in sublist]

		return sorted([self.main_sections[crn].export() for crn in self.main_sections] + flattened_extra_sections, key=lambda x:x["sectionNum"])


def get_course_information():

	all_sections_with_message = get_sections_with_message()
	grouped_sections_by_course = group_sections_by_course(all_sections_with_message)
	parsed_courses = map(Course, grouped_sections_by_course)
	sorted_courses = sorted(parsed_courses, key=lambda x: x.departmentAndCourse)
	formatted_results = [course.export() for course in sorted_courses]
	flattened_sections = [item for sublist in formatted_results for item in sublist]

	return flattened_sections

def get_sections_with_message():
	department_message = re.compile("Department: .*")

	# TODO - switch to grequests

	all_sections_with_message = []

	for credit_type in CreditType:
		html = fetch_course_html(credit_type.value)
		table_rows = extract_table_rows(html)
		filtered_table_rows = filter(lambda x: len(re.findall(department_message, x.text)) == 0, table_rows)
		all_sections_with_message += group_sections_with_message(filtered_table_rows, credit_type.value)

	return all_sections_with_message

def group_sections_with_message(table_rows, credits):
	split_table_rows = map(lambda x: x.find_all('td'), table_rows)
	sections_with_message = []

	# group section with its message, if it has one
	for index, split_table_row in enumerate(split_table_rows):
		if len(split_table_row) > 1:
			has_message = index < len(split_table_rows) - 1 and len(split_table_rows[index + 1]) == 1
			message = split_table_rows[index + 1] if has_message else None
			sections_with_message.append(Section(split_table_row, credits, message))

	# return sorted section list
	return sections_with_message


def group_sections_by_course(sections_with_message):
	grouped_sections = []

	sorted_sections_with_message = sorted(sections_with_message, key=lambda x: x.departmentAndBareCourse)

	# group sections by course
	for key, group in groupby(sorted_sections_with_message, lambda x: x.departmentAndBareCourse):
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

	bare_course_number = department_name + " " + course_number

	return filter(lambda x: x["departmentAndBareCourse"] == bare_course_number, parsed_data)
