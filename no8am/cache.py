from werkzeug.contrib.cache import RedisCache
from time import time
import os

DEFAULT_CACHE_TIME = 172800
REDIS_PASS = os.environ.get("REDIS_PASS")
REDIS_SERVER = os.environ.get("REDIS_SERVER")
DISABLE_CACHE = True

redis_cache = None


def connect_to_cache(func):
	"""
	Connects to cache if connection has not been established.
	"""

	def wrapper(*args, **kwargs):
		if DISABLE_CACHE:
			return None
		global redis_cache
		if redis_cache is not None:
			return
		redis_cache = RedisCache(host=REDIS_SERVER, password=REDIS_PASS, default_timeout=DEFAULT_CACHE_TIME)
		func(*args, **kwargs)

	return wrapper


@connect_to_cache
def cache_get_string(type):
	"""
	Get a string (like a course description) stored in cache

	:param type: name of string to retrieve
	"""

	response = redis_cache.get(type)
	return response


@connect_to_cache
def course_data_get(type):
	"""
	Get course data stored in cache

	:param type: Name of course data (CSCI, W1, ...)
	"""

	response = redis_cache.get(type)
	return response


@connect_to_cache
def course_data_set(type, val, timeout=DEFAULT_CACHE_TIME):
	"""
	Store data in cache.

	:param type: Name of item being stored
	:param val: Data being stored
	:param timeout: Time before data expires
	"""

	if val is None or val == []: return None
	cache_time = int(time())
	redis_cache.set(type, {"set_time": cache_time, "data": val}, timeout)
	return cache_time
