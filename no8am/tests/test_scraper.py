from no8am.scraper import *
import pytest

# ERROR_FILES = ["error"]
# FILENAMES = SUCCESS_FILES + ERROR_FILES


def import_file(filename):
    """
    Helper function to import a single file.

    :param filename: relative path to file
    :return: file text
    """

    with open(filename) as f:
        file_text = f.read()

    return file_text


@pytest.fixture(scope="session", autouse=True)
def import_html_files():
    """
    Fixture to import HTML files before tests begin.

    :return: A dictionary containing filenames and file text
    """

    return {CreditType[credit_type].value: import_file("no8am/tests/webpages/" + credit_type.lower() + "_credit.txt") for credit_type in CreditType.__members__}


# def test_extract_sections_cached_data(import_html_files):
#     """
#     Tests finding rows of section data using test course data.
#
#     :param import_html_files: Local HTML pages used for testing
#     """
#
#     # test finding sections in HTML pages with valid data
#     for success_file in SUCCESS_FILES:
#         assert len(extract_sections(import_html_files[success_file])) > 0
#
#     # test error being raised when an HTML page has no sections
#     for error_file in ERROR_FILES:
#         with pytest.raises(RuntimeError):
#             extract_sections(import_html_files[error_file])


def test_get_course_information(import_html_files, monkeypatch):
    """
    Tests parsing department data into a list of courses.
    Uses monkeypatched department data, so specifying actual name is not necessary.

    :param import_html_files: Local HTML pages used for testing
    :param monkeypatch: Used to mock html fetching function
    """

    monkeypatch.setattr('no8am.scraper.fetch_course_html', lambda name: import_html_files[name])
    monkeypatch.setattr('no8am.scraper.course_data_get', lambda _: None)
    monkeypatch.setattr('no8am.scraper.course_data_set', lambda _, __: None)

    all_sections_with_message = get_sections_with_message()

    for section in all_sections_with_message:
        if section.departmentAndCourse == "CHEM 201":
            assert section.message != None

    grouped_sections_by_course = group_sections_by_course(all_sections_with_message)

    for course in grouped_sections_by_course:
        if course[0].departmentAndBareCourse == "CHEM 201":
            assert len(course) == 17

    parsed_courses = map(Course, grouped_sections_by_course)

    for course in parsed_courses:
        if course.departmentAndCourse == "CHEM 201":
            assert len(course.main_sections.keys()) == 3
            assert len(course.extra_sections['L'].keys()) == 8
            assert len(course.extra_sections['R'].keys()) == 6

            exported_course = course.export()

            for section in exported_course:
                if section["departmentAndCourse"] == "CHEM 201R":
                    assert len(section["dependent_main_sections"]) == 1
                elif section["departmentAndCourse"] == "CHEM 201L":
                    assert len(section["dependent_main_sections"]) == 3
