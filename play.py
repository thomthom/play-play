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

# from tinydb import TinyDB, Query
# from tinydb_serialization import SerializationMiddleware
# from datetime_serializer import DateTimeSerializer

from sqlite3 import dbapi2 as sqlite3

from flask import Flask, render_template, jsonify, request, current_app, g
from flask.views import MethodView

################################################################################
# Setup:

# Paths
# project_path = os.path.dirname(__file__)

# Database Serialization
# serialization = SerializationMiddleware()
# serialization.register_serializer(DateTimeSerializer(), 'TinyDate')

# Database Config
# db_file = os.path.join(project_path, 'database', 'play.json')
# db = TinyDB(db_file, storage=serialization)

# Server
app = Flask(__name__)

app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'database', 'play.sqlite')
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)


def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(current_app.config['DATABASE'],
                         detect_types=sqlite3.PARSE_DECLTYPES)
    rv.row_factory = sqlite3.Row
    return rv


def init_db():
    """Initializes the database."""
    db = get_db()
    with current_app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db


################################################################################
# Utilities:

def get_last_matches(limit=20):
    db = get_db()
    cur = db.execute('select * from matches order by id desc limit ?', limit)
    entries = cur.fetchall()
    return entries
    # table = db.table('matches')
    # result = table.all()
    # return result

def add_match():
    # if not session.get('logged_in'):
        # abort(401)
    data = [
        request.form['game_title'],
        request.form['game_url'],
        request.form['start_time'],
        request.form['players_min'],
        request.form['players_max'],
    ]
    db = get_db()
    db.execute('insert into matches'
               '(title, url, start_time, players_min, players_max)'
               'values (?, ?)',
               data)
    db.commit()
    # row = {
    #     'game' : {
    #         'title' : request.form['game_title'],
    #         'url' : request.form['game_url'],
    #     },
    #     'start_time' : dateutil.parser.parse(request.form['start_time']),
    #     'players' : {
    #         'registered' : [],
    #         'min' : request.form['players_min'],
    #         'max' : request.form['players_max'],
    #     },
    #     'winner' : None
    # }
    # table = db.table('matches')
    # table.insert(row)
    return True


################################################################################
# Routes:

@app.route('/')
def index():
    # TODO(thomthom): Use jinja template and inject app title.
    return app.send_static_file('index.html')


class MatchRoute(MethodView):

    def get(self):
        matches = get_last_matches()
        return jsonify(matches)

    def post(self):
        return jsonify(add_match())

app.add_url_rule('/api/v1/matches', view_func=MatchRoute.as_view('match'))
