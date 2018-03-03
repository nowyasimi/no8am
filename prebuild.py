# TODO - create different cloudfront distributions and S3 buckets for static files in different environments

import sys
sys.path.append('.')
from no8am.minify import update_static_files, update_metadata, invalidate_cache

S3_BUCKET_NAME_PROD = "no8.am"
S3_BUCKET_NAME_BETA = "beta-no8.am"

def update_static_files_wrapper():

    update_static_response = None
    update_metadata_response = None
    stage_response = None
    s3_bucket_name = None

    # Ask developer if static file update is necessary
    while update_static_response not in ['y', 'n']:
        update_static_response = raw_input("Update static files? [y/n]: ")

    while update_metadata_response not in ['y', 'n']:
        update_metadata_response = raw_input("Update metadata? [y/n]: ")

    update_static_requested = update_static_response == "y"
    update_metadata_requested = update_metadata_response == "y"
    update_requested = update_static_requested or update_metadata_requested

    if update_requested:
        while stage_response not in ['beta', 'prod']:
            stage_response = raw_input("Stage? [beta/prod]: ")
        if stage_response == 'beta':
            s3_bucket_name = S3_BUCKET_NAME_BETA
        elif stage_response == 'prod':
            s3_bucket_name = S3_BUCKET_NAME_PROD

    # update the requested files to S3 and invalidate the CloudFront cache
    if update_static_requested:
        update_static_files(s3_bucket_name)

    if update_metadata_requested:
        update_metadata(s3_bucket_name)

    if update_requested:
        invalidate_cache()


# TODO - improve workaround to get multiple scheduled events for the same function
#        https://github.com/Miserlou/Zappa/issues/506 - check for PR to Zappa


def update_metadata_wrapper_a():
    update_metadata(S3_BUCKET_NAME_PROD)
    invalidate_cache()


def update_metadata_wrapper_b():
    update_metadata(S3_BUCKET_NAME_PROD)
    invalidate_cache()


def update_metadata_wrapper_c():
    update_metadata(S3_BUCKET_NAME_PROD)
    invalidate_cache()


def update_metadata_wrapper_d():
    update_metadata(S3_BUCKET_NAME_PROD)
    invalidate_cache()
