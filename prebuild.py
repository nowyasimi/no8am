# TODO - create different cloudfront distributions and S3 buckets for static files in different environments

import sys
sys.path.append('.')
from no8am.minify import update_static_files, update_metadata, invalidate_cache


def update_static_files_wrapper():

    update_static_response = None
    update_metadata_response = None

    # Ask developer if static file update is necessary
    while update_static_response not in ['y', 'n']:
        update_static_response = raw_input("Update static files? [y/n]: ")

    while update_metadata_response not in ['y', 'n']:
        update_metadata_response = raw_input("Update metadata? [y/n]: ")

    # update the requested files to S3 and invalidate the CloudFront cache
    if update_static_response:
        update_static_files()

    if update_metadata_response:
        update_metadata()

    if update_metadata_response or update_static_response:
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
