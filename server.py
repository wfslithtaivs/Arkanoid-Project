"""Arkanoid Project """

from model import *
from jinja2 import StrictUndefined
from flask import Flask, jsonify, render_template, redirect, request, flash, session
from flask_debugtoolbar import DebugToolbarExtension
from passlib.hash import pbkdf2_sha256
import urllib2
import json

## find urlsafe_token method!

# Init Flask application and attach db
app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

## REMOVE FROM PRODUCTION
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Arkanoid Project"""

    return render_template("index.html")


@app.route('/login_user', methods=['GET'])
def login_user():
    """ Logs user in and add his ID in the (flask) session object if it:
        - exists in database
        - and password provided matches password in the database
        Otherwise:
        - catches errors, flash messages and redirect to register form
    """

    # since we have a GET request, lookup for arguments in request.args
    username = request.args.get("username")
    password = request.args.get("password")
    print "Current credentials", username, password

    user = User.query.filter_by(username=username).first()

    if user:
        if pbkdf2_sha256.verify(password, user.password_token):
            flash('You were successfully logged in')
            session["current_user"] = user.user_id
            session["avatar"] = user.avatar
            session["name"] = user.username
            return redirect("/")
            # return redirect("users/{}".format(user.user_id))
        else:
            flash('Wrong credentials. Try again!')
            return redirect("/")
    else:
        flash('Sorry, {}, you are not our user. Shame on you!'.format(username))
        return redirect("/register")


@app.route('/logout')
def logout():
    """Logout user
       remove current_user from flask.session
       flash success message
       and redirect to homepage
    """

    del session["current_user"]
    flash('You were logged out. See you later!')

    return redirect('/')


@app.route("/register", methods=["POST"])
def register_process():
    """Display registration form and register user in DB"""

    username = request.form.get('username')
    password = request.form.get('password')
    is_avatar = request.form.get('want_avatar')
    avatar = None

    query = User.query.filter_by(username = username).first()

    # check if user already in DB, if not - add him
    if query:
        flash("Already in DB")
    else:
        # encrypt password with salty hash
        password_token = pbkdf2_sha256.hash(password)

        if is_avatar == 'true':
            url_data = urllib2.urlopen("https://randomuser.me/api/?inc=picture").read()
            pic_data = json.loads(url_data)['results'][0]
            avatar = pic_data.get('picture')['large']

        if avatar:
            user = User(username=username,
                        password_token=password_token,
                        avatar=avatar)
        else:
            user = User(username=username,
                        password_token=password_token)

        db.session.add(user)
        db.session.commit()
        flash("New user - {} - succesfully created".format(username))

    return redirect("/")


@app.route("/users/<user_id>")
def user_profile(user_id):
    """Render current user profile"""
 
    current_user = session.get("current_user")
    user_id = int(user_id)

    if current_user:
        c_user_id = User.query.filter_by(user_id=current_user).first()
        c_user_id = c_user_id.user_id
        if c_user_id == user_id:
            return render_template("user_profile.html", 
                                    time=datetime.now(),
                                    games_in_progress=User.query.get(user_id).games)
    else:
        flash("For some reasons, you are not allowed to see this profile")

    return redirect("/")


@app.route("/users")
def users():
    """List all the users with avatars"""

    users = User.query.all()

    return render_template("users.html", users=users)


@app.route("/log_game", methods=["POST"])
def log_game():
    """Create new game record in DB"""

    data = request.form.keys()
    data = json.loads(data[0])
    current_user = session.get("current_user")

    # if id of game exist (check session["current_game"]) - then update
    # if game "won" -> remove saving_info and keep only stats - scores, and date finished

    # defensive coding
    # add check in forms - show save button only of user exists and game paused

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
            return render_template("index.html")
    else:
        flash("For some reasons, you are not allowed to see this profile")

    return redirect("/")


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
