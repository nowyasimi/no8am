from no8am.scraper import *
import pytest

SUCCESS_FILES = ["department", "ccc", "credit"]
ERROR_FILES = ["error"]
FILENAMES = SUCCESS_FILES + ERROR_FILES


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

    return {filename: import_file("no8am/tests/webpages/" + filename + ".html") for filename in FILENAMES}


def test_extract_sections_cached_data(import_html_files):
    """
    Tests finding rows of section data using test course data.

    :param import_html_files: Local HTML pages used for testing
    """

    # test finding sections in HTML pages with valid data
    for success_file in SUCCESS_FILES:
        assert len(extract_sections(import_html_files[success_file])) > 0

    # test error being raised when an HTML page has no sections
    for error_file in ERROR_FILES:
        with pytest.raises(RuntimeError):
            extract_sections(import_html_files[error_file])


def test_department_lookup(import_html_files, monkeypatch):
    """
    Tests parsing department data into a list of courses.
    Uses monkeypatched department data, so specifying actual name is not necessary.

    :param import_html_files: Local HTML pages used for testing
    :param monkeypatch: Used to mock html fetching function
    """

    monkeypatch.setattr('no8am.scraper.fetch_course_html', lambda name, _: import_html_files[name])
    monkeypatch.setattr('no8am.scraper.course_data_get', lambda _: None)
    monkeypatch.setattr('no8am.scraper.course_data_set', lambda _, __: None)

    _, processed_department_data = Department.process_department_request('department')

    # verify courses exist
    assert len(processed_department_data) > 0

    # verify first course has sections
    first_course_sections = processed_department_data[0]['sections']
    assert len(first_course_sections) > 0

    # verify first section has extra sections
    first_section = first_course_sections.itervalues().next()
    assert len(first_section['extra_section_lists']['L']) > 0


def test_ccc_and_credit_lookup(import_html_files, monkeypatch):
    """
    Tests parsing ccc and credit data into a list of courses.
    Uses monkeypatched data, so specifying actual names is not necessary.

    :param import_html_files: Local HTML pages used for testing
    :param monkeypatch: Used to mock html fetching function
    """

    monkeypatch.setattr('no8am.scraper.fetch_course_html', lambda name, _: import_html_files[name])
    monkeypatch.setattr('no8am.scraper.course_data_get', lambda _: None)
    monkeypatch.setattr('no8am.scraper.course_data_set', lambda _, __: None)

    for course_type in ['ccc', 'credit']:
        _, processed_data = Department.process_department_request(course_type)

        # verify courses exist
        assert len(processed_data) > 0

        # verify first course has sections
        first_course_sections = processed_data[0]['sections']
        assert len(first_course_sections) > 0
