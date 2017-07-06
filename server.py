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


############################# User routes #############################
@app.route('/')
def index():
    """Arkanoid Project"""

    return render_template("index.html")


@app.route('/login_guest', methods=['GET'])
def login_guest():
    """ Login guset with default credentials"""

    add_user_to_session(User.get_guest_user())
    return redirect('/')


@app.route('/login_user', methods=['POST'])
def login_user():
    """ Logs user in and add his ID in the (flask) session object if it:
        - exists in database
        - and password provided matches password in the database
        Otherwise:
        - catches errors, flash messages and redirect to register form
    """

    user = User.get_user_by_credentials(request.form.get("username"),
                                        request.form.get("password"))

    if user:
        add_user_to_session(user)
        return redirect('/users/{}'.format(user_id))
    else:
        flash('Wrong credentials')
        return redirect('/')


@app.route('/logout')
def logout():
    """Logout user and redirect to homepage"""

    del session["current_user"]
    flash('You were logged out. See you later!')
    return redirect('/')


@app.route("/register", methods=["POST"])
def register_process():
    """Display registration form and register user in DB"""

    rqf = request.form
    avatar = get_avatar() if (rqf.get('want_avatar') == "true") else None
    flash(User.create_user(rqf.get('username'), rqf.get('password'), avatar))

    return redirect("/")


@app.route("/users/<user_id>")
def user_profile(user_id):
    """Show profile to owner"""

    session_user_id = session.get("current_user")
    user_id = int(user_id)

    if session_user_id:
        page_user = User.get_user_by_id(user_id)
        if session_user_id == page_user.user_id:
            return render_template("user_profile.html",
                                    time=datetime.now(),
                                    games_in_progress=page_user.games)
    else:
        flash("For some reasons, you are not allowed to see this profile")

    return redirect("/")


@app.route("/users")
def users():
    """List all the users with avatars"""

    users = User.query.all()
    return render_template("users.html", users=users)


############################# Game routes #############################
@app.route("/log_game", methods=["POST"])
def log_game():
    """Create new game record in DB"""

    data = request.form.keys()
    data = json.loads(data[0])
    current_user = session.get("current_user")

    # if id of game exist (check session["current_game"]) - then update
    # if game "won" -> remove saving_info and keep only stats - scores, and date finished

    if current_user:
        game = Game(user_id=current_user,
                    last_saving=data)
        db.session.add(game)
        db.session.commit()

        return jsonify({"game_id": game.game_id})
    else:
        return "No user provided"


@app.route("/get_game.json")
def get_game():
    """Get json with saved game state by game id"""

    game_id = request.args.get("game_id")
    game_log = Game.query.get(int(game_id)).last_saving

    return jsonify(game_log)


@app.route("/load_game/<game_id>")
def load_game(game_id):
    """Load saved game"""

    current_user = session.get("current_user")
    game_id = int(game_id)

    if current_user:
            saved_game = Game.query.get(game_id)
            session["saved_game"] = json.dumps(saved_game.last_saving)
    else:
        flash("For some reasons, you are not allowed to see this profile")

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
