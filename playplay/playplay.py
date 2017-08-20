# -*- coding: utf-8 -*-

import datetime
import dateutil.parser
import os

from sqlite3 import dbapi2 as sqlite3
from flask import Flask, jsonify, g, redirect, render_template, request
from flask.views import MethodView


# Create application instance.
app = Flask(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'database', 'play.sqlite'),
    DEBUG=True,
))
app.config.from_envvar('PLAYPLAY_SETTINGS', silent=True)


################################################################################
# Database:

def connect_db():
    """Connects to the specific database."""
    # rv = sqlite3.connect(app.config['DATABASE'])
    rv = sqlite3.connect(app.config['DATABASE'],
                         detect_types=sqlite3.PARSE_DECLTYPES)
    # rv.row_factory = sqlite3.Row
    rv.row_factory = dict_factory
    return rv


def init_db():
    """Initializes the database."""
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables."""
    init_db()
    print('Initialized the database.')


def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db


@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


################################################################################
# Utilities:

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


# For some reason, SQLite doesn't seem to do a full round trip of datetime.
# It store datetime with timezone info appended which then later chokes when
# the date is parsed back. For now, using this until the reason for this
# weirdness is determined.
def utc_datetime(string):
    date = dateutil.parser.parse(string)
    utc_date = date.astimezone(datetime.timezone.utc)
    return utc_date.replace(tzinfo=None)


def get_last_matches(limit=20):
    db = get_db()
    cur = db.execute('SELECT * FROM matches ORDER BY id DESC LIMIT ?', [limit])
    entries = cur.fetchall()
    return entries


def add_match():
    data = [
        request.form['game_title'],
        request.form['game_url'],
        # db_time(request.form['start_time']),
        utc_datetime(request.form['start_time']),
        request.form['players_min'],
        request.form['players_max']
    ]
    db = get_db()
    db.execute('insert into matches'
               '(game_title, game_url, start_time, players_min, players_max)'
               'values (?, ?, ?, ?, ?)',
               data)
    db.commit()
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
        print(matches)
        return jsonify(matches)

    def post(self):
        return jsonify(add_match())


app.add_url_rule('/api/v1/matches', view_func=MatchRoute.as_view('match'))
