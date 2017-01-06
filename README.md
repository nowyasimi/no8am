no8am [![Build Status](https://travis-ci.com/nowyasimi/no8am.svg?token=xptabDthiPrFvZ5xLTzX&branch=master)](https://travis-ci.com/nowyasimi/no8am) [![Website](https://img.shields.io/website/https/no8.am.svg)](https://no8.am)
==================

A dynamic course scheduling platform. Helps students easily create their course schedules each semester.

API
-------

### Course

| Endpoint | Description |
| ---- | --------------- |
| [GET /course](https://no8.am/course) | Get a list of departments |
| [GET /course/:department](https://no8.am/course/CSCI) | Get a list of course data for the department |
| [GET /course/:department/:course_number](https://no8.am/course/CSCI/203) | Get a list of sections for the course |

### Category

| Endpoint | Description |
| ---- | --------------- |
| [GET /category/:category](https://no8.am/category/ccc) | Get a list of lookup options for the category |
| [GET /category/:category/:value](https://no8.am/category/ccc/NSMC) | Get a list of course data for the category |

Keep in mind that this API is not yet versioned and is subject to change at any time.

Develop
-------

It's a good idea to create and activate a [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/) environment first to avoid installing dependencies globally.


    git clone ssh://git@github.com/nowyasimi/no8am.git
    cd no8am
    pip install -r requirements.txt
    python run.py

That's it! Open a web browser and go to `localhost:3000`.

Deploy
-------

TODO
