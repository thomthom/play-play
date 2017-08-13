import datetime
from dateutil.relativedelta import relativedelta

import os

from pprint import pprint

from tinydb import TinyDB, Query
# from tinydb.storages import JSONStorage
from tinydb_serialization import SerializationMiddleware
from datetime_serializer import DateTimeSerializer

project_path = os.path.dirname(__file__)

serialization = SerializationMiddleware()
serialization.register_serializer(DateTimeSerializer(), 'TinyDate')

db_file = os.path.join(project_path, 'database', 'play.json')
# if not os.path.exists(db_file):
#     os.mknod(db_file)
db = TinyDB(db_file, storage=serialization)

from flask import Flask, render_template
app = Flask(__name__)

# https://www.raspberrypi.org/learning/python-web-server-with-flask/worksheet/

# set FLASK_APP=play.py
# set FLASK_DEBUG=1
# flask ruin


def seed_dummy():
    start_time = datetime.datetime.now() + datetime.timedelta(minutes=32)
    row = {
            'game' : {
                'title' : 'Exploding Kittens',
                'url' : 'https://boardgamegeek.com/boardgame/172225/exploding-kittens'
            },
            # 'start_time' : start_time.isoformat(), # ISO-8601
            'start_time' : start_time, # ISO-8601
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
    if not result:
        seed_dummy()
        result = table.all()
    return result

# TODO: Clean up!
@app.template_filter('humantime')
def human_readable(start_time):
    now = datetime.datetime.now()
    pprint(now)
    pprint(start_time)
    delta = relativedelta(start_time, now)
    attrs = ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
    hr = lambda delta: [
        '%d %s' % (getattr(delta, attr), getattr(delta, attr) > 1 and attr or attr[:-1]) 
            for attr in attrs if getattr(delta, attr)
    ]
    # TODO: Return abbreviations: d, h, min, s
    relative_time = hr(delta)[0]
    day_time = '{:%a %H:%M}'.format(start_time)
    return 'In {} @ {}'.format(relative_time, day_time)

# https://stackoverflow.com/a/4830620/486990

@app.route('/')
def index():
    # Dummy data. Replace with db.
    # start_time = datetime.datetime.now() + datetime.timedelta(minutes=32)
    # now = datetime.datetime.now()
    # delta = relativedelta(start_time, now)
    # matches = [
    #     {
    #         'game' : {
    #             'title' : 'Exploding Kittens',
    #             'url' : 'https://boardgamegeek.com/boardgame/172225/exploding-kittens'
    #         },
    #         'start_time' : human_readable(start_time),
    #         'players' : {
    #             'registered' : ['Thom', 'David'],
    #             'min' : 2,
    #             'max' : 5,
    #         },
    #         'winner' : None
    #     }
    # ]
    matches = get_matches()
    return render_template('index.html', matches=matches)


@app.route("/players/add")
def add_player():
    return "Add Player"


@app.route("/games")
def list_games():
    return "List games"

@app.route("/games/add")
def add_game():
    return "Add game"

@app.route("/games/<game_id>/edit")
def edit_game(game_id):
    return render_template('page.html', game_id=game_id)

@app.route("/games/remove")
def remove_game():
    return "Remove game"
