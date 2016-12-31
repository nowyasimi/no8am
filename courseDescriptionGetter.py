import requests
from bs4 import BeautifulSoup
import json
import requests_cache # TODO - remove requests cache
import io
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

requests_cache.install_cache('course_cache', backend='sqlite', expire_after=43200)

TERM = '201705'

# TODO - make this a cron job and write to S3

from bucknellDepartments import departments

departments = [x["short"] for x in departments]

def bucknellSendR(department):
	# print('starting request')
	payload = {'term': TERM, 'param1': department, 'lookopt': 'DPT', 'frstopt': '', "openopt" : "ALL"}
	r = requests.get("https://www.bannerssb.bucknell.edu/ERPPRD/hwzkschd.P_Bucknell_SchedDisplay", params=payload)
	# print('request retrieved')
	return r.text

def bucknellCourseNumsGrabber(data, dept):
  soup = BeautifulSoup(data)
  a = []
  try:
    tableSections = soup.find_all(id="coursetable")[0] # navigates to table
  except:
	return []
  sections = tableSections.find_all("tr")[1:] # separates into sections as list
  for x in range(len(sections)):
    data = sections[x].find_all("td")
    if len(data) > 5: # Handle a section
      courseNum = str(''.join(data[1].strings)).replace('\n', '').split(' ')[1]
      if (len(courseNum) == 3 or (courseNum[-1] not in ["E", "R", "L", "P"])) and courseNum not in a:
        print "adding courseNum:" + courseNum
        a.append(courseNum)
  final = []
  for x in a:
    final.append(dept + " " + x)
  return final

def parseAndCurate():
  courseNums = getAllCourseNums()
  print "doing descriptions...."
  final = []
  rows = getDescriptions()

  for x in range(len(rows)):
    if x % 2 == 0:
	  numAndName = str(rows[x].text).strip()
	  courseNum = numAndName.split(" - ")[0]
	  courseName = numAndName.split(" - ")[1]
	  if courseNum not in courseNums:
		continue
	  info = rows[x+1].strings
	  count = 0
	  for x in info:
		if count == 0:
			count += 1
		elif count == 1:
			realInfo = x.strip().replace("\n", " ")
			break
	  temp = {}
  	  temp["courseNum"] = courseNum
	  temp["courseName"] = courseName
	  temp["info"] = realInfo
	  final.append(temp)

  # TODO - add courses that are not in descriptions (without description)
  # might not be necessary, mostly shows crosslisted courses

  # print "adding missing courses"
  # courseNumsWithDescriptions = [x["courseNum"] for x in final]
  # missingCourseNums = [x for x in courseNums if x not in courseNumsWithDescriptions]
  # print "missing courses:"
  # print missingCourseNums
  return final

def getDescriptions():
   payload = [("term_in", TERM), ("call_proc_in","bwckctlg.p_disp_dyn_ctlg"),
   ("sel_subj","dummy"), ("sel_levl","dummy"), ("sel_schd","dummy"), ("sel_coll","dummy"),
   ("sel_divs","dummy"), ("sel_dept","dummy"), ("sel_attr","dummy")]
   for x in departments:
     payload.append(("sel_subj", x))
   r = requests.get("https://www.bannerssb.bucknell.edu/ERPPRD/bwckctlg.p_display_courses", params=payload)
   soup = BeautifulSoup(r.text)
   table = soup.find_all("table")[3]
   rows = table.find_all("tr")
   return rows

def getAllCourseNums():
  courseNums = []
  print "Getting course nums..."
  for x in departments:
	print x
	courseNums += bucknellCourseNumsGrabber(bucknellSendR(x), x)
  return courseNums


def main():
  descriptions = parseAndCurate()
  with io.open("static/bucknellCourseDescriptions.json", "w", encoding='utf8') as f:
	f.write("courseDescriptions = [".decode("utf8"))
	for x in range(len(descriptions)):
	  data = json.dumps(descriptions[x], ensure_ascii=False).decode('utf8')
	  try:
		f.write(data)
	  except TypeError:
		# Decode data to Unicode first
		f.write(data.decode('utf8'))
	  if x != len(descriptions) - 1:
		f.write(", ".decode("utf8"))
	f.write("]".decode("utf8"))

if __name__ == '__main__':
	main()
