import boto3
import time
import string
import random

DYNAMODB_TABLE_NAME = 'no8am-links'


def store_link(link, schedule):
	"""
	Stores course data in the database.

	:param link: Link to schedule
	:param schedule: A string containing schedule data
	"""

	dynamodb = boto3.client('dynamodb')

	data_to_store = {
		"key": {"S": link},
		"schedule": {"S": schedule},
		"time": {"N": str(int(time.time()))}
	}

	dynamodb.put_item(
		TableName=DYNAMODB_TABLE_NAME,
		Item=data_to_store
	)


def get_link(link):
	"""
	Retrieves data for link stored in database.

	:param link: Link to schedule
	:return: Amazon DynamoDB response object, which may or may not contain course data depending on validity of link
	"""

	dynamodb = boto3.client('dynamodb')

	return dynamodb.get_item(
		TableName=DYNAMODB_TABLE_NAME,
		Key={
			"key": {"S": link}
		}
	)


def check_link_available(link):
	"""
	Check if current link is available for use in database.

	:param link: Potential link to store in database
	:return: True if link is available
	"""

	return "Item" not in get_link(link).keys()


def generate_short_link():
	"""
	Generates a unique link to store a schedule in the database.

	:return: Link to schedule
	"""

	link_search_attempts = 5
	link_length = 4
	
	for x in range(link_search_attempts):
		link_string = "".join([random.choice(string.letters + string.digits) for x in range(link_length)])
		if check_link_available(link_string):
			return link_string
