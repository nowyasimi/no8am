from no8am.scraper import *

LIVE_COURSE_DATA = {
    "CHEM": LookupType.DEPARTMENT,
    "NSMC": LookupType.CCC,
    ".5": LookupType.CREDIT
}


def test_extract_sections_live_data():
    """
    Tests finding rows of sections data using live course data.
    """

    for payload_value, lookup_type in LIVE_COURSE_DATA.iteritems():
        course_html = fetch_course_html(payload_value, lookup_type)
        assert len(extract_sections(course_html)) > 0
