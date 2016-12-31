from no8am.database import store_link, check_link_available
from no8am.views import generate_short_link

COURSE_DATA = '{"ECEG 240":{"main":["57833","02"],"L":["57835","61"]},"MATH 245":{"main":["56573","02"]}}'


def test_check_link_available():
    assert check_link_available("nadeem") is False


def test_generate_short_link():
    link = generate_short_link()

    assert link is not None
    assert len(link) == 4


def test_store_link():
    link = generate_short_link()
    print "link is: " + link

    store_link(link, COURSE_DATA)