from time import time
import boto3
import json
import zlib

from no8am import ENABLE_CACHE

# TODO - adjust cache time based on time of year
DEFAULT_CACHE_TIME = 3600
DYNAMODB_COURSE_DATA_TABLE_NAME = 'no8am-course-data'

dynamodb_client = None


def connect_to_cache(func):
	"""
	Creates instance of cache object if it does not exist and caching
	is enabled.
	"""

	def wrapper(*args, **kwargs):
		if ENABLE_CACHE is None:
			return None, None
		global dynamodb_client
		if dynamodb_client is None:
			dynamodb_client = boto3.client("dynamodb")
		return func(*args, **kwargs)

	return wrapper


@connect_to_cache
def course_data_get(primary_key):
	"""
	Get course data stored in cache

	:param type: Name of course data eg CSCI, W1, 34934details (for section details)
	:return: The item if it exists in the cache, or None if does not exist
	"""

	get_item_result = dynamodb_client.get_item(
		TableName=DYNAMODB_COURSE_DATA_TABLE_NAME,
		Key={
			"primary_key": {"S": primary_key}
		}
	)

	if "Item" in get_item_result.keys():
		# get age of item to check if item has expired
		item = get_item_result["Item"]
		last_updated_time = int(item["last_updated_seconds"]["N"])
		expiration_time_seconds = last_updated_time + int(item["expiration_seconds"]["N"])

		return {
			"last_updated_seconds": int(item["last_updated_seconds"]["N"]),
			"expiration_seconds": int(item["expiration_seconds"]["N"]),
			"data": json.loads(zlib.decompress(item["data"]["B"]))
		}, None

	else:
		return None, None


@connect_to_cache
def course_data_set(primary_key, val, timeout=DEFAULT_CACHE_TIME):
	"""
	Store data in cache.

	:param type: Name of item being stored
	:param val: Data being stored
	:param timeout: Time before data expires
	"""

	if val is None or val == []:
		return None, None

	cache_time = int(time())

	data_to_store = {
		"primary_key": {"S": primary_key},
		"data": {"B": zlib.compress(json.dumps(val))},
		"last_updated_seconds": {"N": str(cache_time)},
		"expiration_seconds": {"N": str(timeout)}
	}

	dynamodb_client.put_item(
		TableName=DYNAMODB_COURSE_DATA_TABLE_NAME,
		Item=data_to_store
	)

	return cache_time, None
