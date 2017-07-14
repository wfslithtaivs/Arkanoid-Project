"""Arkanoid Project """

from model import *
from jinja2 import StrictUndefined
from flask import Flask, jsonify, render_template, redirect, request, flash, session
from flask_debugtoolbar import DebugToolbarExtension
import urllib2
import json

# Init Flask application and attach db
app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "sldjflksf"

##TODO: REMOVE FROM PRODUCTION
app.jinja_env.undefined = StrictUndefined

############################# Messages #############################
MESSAGES = {'logout': 'You were logged out. See you later!',
            'register_failed': 'User already in out base, please, login',
            'wrong_credentials': 'Wrong credentials',
            'access_denied': "Sorry, you are not allowed to see this page",
            'no_user_provided': 'No user provided'}


############################# Test area #############################

############################# User routes #############################
@app.route('/')
def index():
    """Renders index page of Arkanoid Project"""

    user = session.get("current_user")

    if user: 
        return render_template("index.html")
    else:
        return render_template("start.html")


@app.route('/login_guest', methods=['GET'])
def login_guest():
    """Logs guest with default credentials.
       Add guest ID to the (flask) session object
    """

    add_user_to_session(User.get_guest_user())

    return redirect('/')


@app.route('/login_user', methods=['POST'])
def login_user():
    """ Logs user in and add his ID in the (flask) session object if it.
        If user doesn't exist: flashes message and redirect to default route
    """

    user = User.get_user_by_credentials(request.form.get("username"),
                                        request.form.get("password"))

    if user:
        add_user_to_session(user)
        return redirect('/users/{}'.format(user.user_id))

    # flash(MESSAGES['wrong_credentials'])
    return redirect('/')


@app.route('/logout')
def logout():
    """Logout user by deleting current_user from session object,
       flashes sorry message on success and redirects to default route
    """

    del session["current_user"]
    # flash(MESSAGES['logout'])
    return redirect('/')


@app.route("/register", methods=["POST"])
def register_process():
    """Register user in DB and redirects to user profile.
       If user already in DB or some other transactional troubles -
       redirects to default route
    """

    rqf = request.form
    avatar = get_avatar() if (rqf.get('want_avatar') == "true") else None
    user = User.create_user(rqf.get('username'), rqf.get('password'), avatar)

    if user:
        add_user_to_session(user)
        return redirect('/users/{}'.format(user.user_id))

    # flash(MESSAGES['register_failed'])
    return redirect("/")


@app.route("/users/<user_id>")
def user_profile(user_id):
    """Show profile to owner"""

    session_user_id = session.get("current_user")
    user_id = int(user_id)

    if session_user_id:
        page_user = User.get_user_by_id(user_id)
        games_in_progress = page_user.games
        if session_user_id == page_user.user_id:
            return render_template(
                "user_profile.html",
                time=datetime.now(),
                games_in_progress=games_in_progress,
                total_games=len(games_in_progress),
                games_saved = len([game for game in games_in_progress if game.last_saving["status"] == "saved"]), 
                games_finished = len([game for game in games_in_progress if game.last_saving["status"] == "won"]),
                games_failed = len([game for game in games_in_progress if game.last_saving["status"] == "loose"])
                )


@app.route("/users")
def users():
    """List all the users with avatars"""

    users = User.query.all()
    return render_template("users.html", users=users)


############################# Game routes #############################
@app.route("/log_game", methods=["POST"])
def log_game():
    """Create new game record in DB"""

    # import pdb; pdb.set_trace()

    data = request.get_json()
    current_user = session.get("current_user")

    # if id of game exist (check session["current_game"]) - then update
    # if game "won" -> remove saving_info and keep only stats - scores, and date finished

    if current_user:
        game = Game.create_game(current_user, data)
        return jsonify({"game_id": game.game_id})
    else:
        return MESSAGES['no_user_provided']


# From previous version
# @app.route("/get_game.json")
# def get_game():
#     """Get json with saved game state by game id"""

#     game_id = request.args.get("game_id")

#     game_log = Game.get_game_by_id(int(game_id))

#     if game_log:
#         return jsonify(game_log.last_saving)


@app.route("/load_game/<game_id>")
def load_game(game_id):
    """Load saved game for current user"""

    current_user = session.get("current_user")
    game_id = int(game_id)

    if current_user:
        saved_game = Game.get_game_by_id(game_id)
        del saved_game.last_saving["screenshot"]
        game_data = json.dumps(saved_game.last_saving)
        session["saved_game"] = game_data
    else:
        # flash(MESSAGES['access_denied'])
        return redirect("/")

############################# Helper Functions #############################
def add_user_to_session(user):
    """Add user data to session """

    session.update({'current_user':user.user_id, 
                    'avatar':user.avatar, 
                    'name':user.username})


def get_avatar():
    """ Use API to get random avatar"""

    url_data = urllib2.urlopen("https://randomuser.me/api/?inc=picture").read()
    pic_data = json.loads(url_data)['results'][0]
    return pic_data.get('picture')['large']


if __name__ == "__main__":
    # Debug true
    app.debug = True
    app.jinja_env.auto_reload = app.debug  # make sure templates, etc. are not cached in debug mode

    connect_to_db(app)
    # In case tables haven't been created, create them
    db.create_all()

    # Use the DebugToolbar
    DebugToolbarExtension(app)
    app.run(port=5000, host='0.0.0.0')
