from werkzeug.contrib.cache import RedisCache
from time import time

from no8am import REDIS_PASS, REDIS_SERVER

# TODO - adjust cache time based on time of year
DEFAULT_CACHE_TIME = 60

# cache is disabled if Redis is not configured
DISABLE_CACHE = True if REDIS_PASS is None or REDIS_SERVER is None else False

redis_cache = None


def connect_to_cache(func):
	"""
	Connects to cache if connection has not been established.
	"""

	def wrapper(*args, **kwargs):
		if DISABLE_CACHE:
			return None
		global redis_cache
		if redis_cache is None:
			redis_cache = RedisCache(host=REDIS_SERVER, password=REDIS_PASS, default_timeout=DEFAULT_CACHE_TIME)
		return func(*args, **kwargs)

	return wrapper


@connect_to_cache
def course_data_get(type):
	"""
	Get course data stored in cache

	:param type: Name of course data eg CSCI, W1, 34934details (for section details)
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

	if val is None or val == []:
		return None

	cache_time = int(time())
	redis_cache.set(type, {"set_time": cache_time, "data": val}, timeout)
	return cache_time
