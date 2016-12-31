from no8am.utility import get_bucknell_format_semester
from freezegun import freeze_time


@freeze_time("2016-11-01")
def test_get_bucknell_format_semester_early_spring():
    """
    Verifies that dates early in the Spring course registration period generate a string that can be used to
    scrape Bucknell servers.
    """

    assert get_bucknell_format_semester() == '201705'


@freeze_time("2017-2-01")
def test_get_bucknell_format_semester_late_spring():
    """
    Verifies that dates late in the Spring course registration period generate a string that can be used to
    scrape Bucknell servers.
    """

    assert get_bucknell_format_semester() == '201705'


@freeze_time("2017-05-01")
def test_get_bucknell_format_semester_fall():
    """
    Verifies that dates in the Fall course registration period generate a string that can be used to
    scrape Bucknell servers.
    """

    assert get_bucknell_format_semester() == '201801'
