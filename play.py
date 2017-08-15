# Boardgame Play List
#
# https://www.raspberrypi.org/learning/python-web-server-with-flask/worksheet/
#
# set FLASK_APP=play.py
# set FLASK_DEBUG=1
# flask run

import datetime
import os

import dateutil.parser
from dateutil.relativedelta import relativedelta

from tinydb import TinyDB, Query
from tinydb_serialization import SerializationMiddleware
from datetime_serializer import DateTimeSerializer

from flask import Flask, render_template, jsonify, request

################################################################################
# Setup:

# Paths
project_path = os.path.dirname(__file__)

# Database Serialization
serialization = SerializationMiddleware()
serialization.register_serializer(DateTimeSerializer(), 'TinyDate')

# Database Config
db_file = os.path.join(project_path, 'database', 'play.json')
db = TinyDB(db_file, storage=serialization)

# Server
app = Flask(__name__)

################################################################################
# Utilities:

def seed_dummy(minutes=32):
    start_time = datetime.datetime.now() + datetime.timedelta(minutes=minutes)
    row = {
        'game' : {
            'title' : 'Exploding Kittens',
            'url' : 'https://boardgamegeek.com/boardgame/172225/exploding-kittens'
        },
        'start_time' : start_time,
        'players' : {
            'registered' : ['Thom', 'David'],
            'min' : 2,
            'max' : 5,
        },
        'winner' : None
    }
    table = db.table('matches')
    table.insert(row)


def get_matches():
    table = db.table('matches')
    result = table.all()
    # TODO: Remove debug seeding.
    if not result:
        seed_dummy()
        result = table.all()
    return result

def add_match():
    print('Adding Match!')
    print(request)
    print(request.form)
    row = {
        'game' : {
            'title' : request.form['game_title'],
            'url' : request.form['game_url'],
        },
        'start_time' : dateutil.parser.parse(request.form['start_time']),
        'players' : {
            'registered' : [],
            'min' : request.form['players_min'],
            'max' : request.form['players_max'],
        },
        'winner' : None
    }
    table = db.table('matches')
    table.insert(row)
    return True


################################################################################
# Routes:

@app.route('/')
def index():
    matches = get_matches()
    return app.send_static_file('index.html')


@app.route('/api/v1/matches', methods=['GET', 'POST'])
def list_matches():
    if request.method == 'POST':
        return jsonify(add_match())
    else:
        matches = get_matches()
        return jsonify(matches)
