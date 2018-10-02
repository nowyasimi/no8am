import httplib, urllib, time, random, os
import json
import boto3
from wsgiref.handlers import format_date_time
from no8am.utility import get_bucknell_format_semester
from no8am.scraper import get_course_information
from no8am.cache import course_data_get, course_data_set

S3_BUCKET_NAME_BETA = "beta-no8.am"

MAX_AGE_SECONDS = 60 * 60 * 23
MIN_AGE_SECONDS = 45

STATUS_PAGE_API_BASE = 'api.statuspage.io'
STATUS_PAGE_API_KEY = os.environ.get('STATUS_PAGE_API_KEY')
STATUS_PAGE_PAGE_ID = os.environ.get('STATUS_PAGE_PAGE_ID')
STATUS_PAGE_LAST_UPDATE_METRIC_ID = os.environ.get('STATUS_PAGE_LAST_UPDATE_METRIC_ID')


def poll_database_to_check_if_update_needed():
    term = get_bucknell_format_semester()
    cached_record, _ = course_data_get(term)
    last_expiration_seconds = None
    last_sections = None

    if cached_record is not None:
        last_expiration_seconds = cached_record["expiration_seconds"]
        last_updated_seconds = cached_record["last_updated_seconds"]
        expiration_seconds = last_updated_seconds + last_expiration_seconds
        last_sections = cached_record["data"]

        current_time = int(time.time())

        if STATUS_PAGE_API_KEY is not None:
            params = urllib.urlencode({'data[timestamp]': current_time, 'data[value]': current_time - last_updated_seconds})
            headers = {"Content-Type": "application/x-www-form-urlencoded", "Authorization": "OAuth " + STATUS_PAGE_API_KEY}
            conn = httplib.HTTPSConnection(STATUS_PAGE_API_BASE)
            conn.request("POST", "/v1/pages/" + STATUS_PAGE_PAGE_ID + "/metrics/" + STATUS_PAGE_LAST_UPDATE_METRIC_ID + "/data.json", params, headers)
            print conn.getresponse()
        if time.time() <= expiration_seconds:
            return

    sections = get_course_information()
    next_expiration_seconds = choose_next_expiration_seconds(last_expiration_seconds, last_sections, sections)
    next_updated_seconds, _ = course_data_set(term, sections, next_expiration_seconds)

    boto3.resource('s3').Object(S3_BUCKET_NAME_BETA, 'static/sections.json').\
        put(Body=json.dumps({
                "data": sections,
                "last_updated_seconds": next_updated_seconds,
                "expiration_seconds": next_expiration_seconds
            }, ensure_ascii=False),
            ContentType='application/json',
            Expires=format_date_time(next_updated_seconds + next_expiration_seconds))


def choose_next_expiration_seconds(last_expiration_seconds, last_sections, next_sections):
    if last_sections == None:
        return MIN_AGE_SECONDS
    if last_sections == next_sections and last_expiration_seconds * 2 > MAX_AGE_SECONDS:
        return MAX_AGE_SECONDS
    elif last_sections == next_sections:
        return last_expiration_seconds * 2
    elif last_sections == next_sections and last_expiration_seconds / 2 < MIN_AGE_SECONDS:
        return MIN_AGE_SECONDS
    else:
        return last_expiration_seconds * 2
