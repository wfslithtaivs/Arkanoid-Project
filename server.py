"""Arkanoid Project """

from model import *
from jinja2 import StrictUndefined
from flask import Flask, jsonify, render_template, redirect, request, flash, session
from flask_debugtoolbar import DebugToolbarExtension
from passlib.hash import pbkdf2_sha256
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


@app.route("/register", methods=["GET", "POST"])
def register_process():
    """Display registration form and register user in DB"""

    if request.method == 'POST':
        # since we have a POST request, lookup for arguments in request.form
        username = request.form.get('username')
        password = request.form.get('password')

        query = User.query.filter_by(username = username).first() 

        # check if user already in DB, if not - add him
        if query:
            flash("Already in DB")
        else:
            # encrypt password with salty hash
            password_token = pbkdf2_sha256.hash(password)
            username = User(username=username,
                         password_token=password_token)
            db.session.add(user)
            db.session.commit()
            flash("New user - {} - succesfully created".format(username))

        return redirect("/")
    elif request.method == "GET":
        """Displays registration form"""

        return render_template("register_form.html")


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
