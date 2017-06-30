"""Models and database functions for games db."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# create ORM object to interact with db
db = SQLAlchemy()

############## Object Model #############################


class User(db.Model):
    """User class"""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50))
    password_token = db.Column(db.String(256))
    avatar = db.Column(db.String(256), default="../static/img/bowie_ipsum.jpg") # store relative path to user-avatar

    ## add relation Games
    games = db.relationship('Game')

class Game(db.Model):
    """Game class"""

    __tablename__ = "games"

    game_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    game_stats = db.Column(db.String(256), default="in progress")
    last_saving = db.Column(db.JSON)
    t_stamp = db.Column(db.DateTime, default=datetime.now())
    #  add level information to game


class Session(db.Model):
    """Session class to keep track of user interactions with existing games"""

    __tablename__ = "sessions"

    session_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    t_stamp = db.Column(db.DateTime)


##########################################################
# Helper functions
def init_app():
    from flask import Flask
    app = Flask(__name__)

    connect_to_db(app)

    print "Connected to DB."


def connect_to_db(app):
    """Connect the database to Flask app."""

    # Configure to use our database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres:///games'
    # Print in log corresponding SQL queries
    app.config['SQLALCHEMY_ECHO'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Link db to flask application
    db.app = app
    db.init_app(app)


if __name__ == "__main__":

    from flask import Flask

    app = Flask(__name__)

    connect_to_db(app)

    print "Connected to DB."
