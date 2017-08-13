import datetime
from dateutil.relativedelta import relativedelta

from flask import Flask, render_template
app = Flask(__name__)

# https://www.raspberrypi.org/learning/python-web-server-with-flask/worksheet/

# set FLASK_APP=play.py
# set FLASK_DEBUG=1
# flask ruin

# TODO: Clean up!
def human_readable(start_time):
    now = datetime.datetime.now()
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


@app.route('/')
def index():
    # Dummy data. Replace with db.
    start_time = datetime.datetime.now() + datetime.timedelta(minutes=32)
    # now = datetime.datetime.now()
    # delta = relativedelta(start_time, now)
    matches = [
        {
            'game' : {
                'title' : 'Exploding Kittens',
                'url' : 'https://boardgamegeek.com/boardgame/172225/exploding-kittens'
            },
            'start_time' : human_readable(start_time),
            'players' : {
                'registered' : ['Thom', 'David'],
                'min' : 2,
                'max' : 5,
            },
            'winner' : None
        }
    ]
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
