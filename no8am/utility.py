from datetime import datetime


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
