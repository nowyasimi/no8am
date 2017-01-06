# TODO - create different cloudfront distributions and S3 buckets for static files in different environments

import sys
sys.path.append('.')
from no8am.minify import update_static_files


# TODO - improve workaround to get multiple scheduled events for the same function - check for pull requests to Zappa

def update_static_files_wrapper():
    update_static_files()


def update_static_files_wrapper_b():
    update_static_files()


def update_static_files_wrapper_c():
    update_static_files()


def update_static_files_wrapper_d():
    update_static_files()
