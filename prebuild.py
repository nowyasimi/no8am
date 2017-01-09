# TODO - create different cloudfront distributions and S3 buckets for static files in different environments

import sys
sys.path.append('.')
from no8am.minify import update_static_files, update_metadata, invalidate_cache


def update_static_files_wrapper():
    invalidate_from_files = update_static_files()
    invalidate_from_metadata = update_metadata()

    if invalidate_from_files or invalidate_from_metadata:
        invalidate_cache()


# TODO - improve workaround to get multiple scheduled events for the same function - check for pull requests to Zappa


def update_metadata_wrapper_a():
    update_metadata()
    invalidate_cache()


def update_metadata_wrapper_b():
    update_metadata()
    invalidate_cache()


def update_metadata_wrapper_c():
    update_metadata()
    invalidate_cache()


def update_metadata_wrapper_d():
    update_metadata()
    invalidate_cache()
