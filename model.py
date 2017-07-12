"""Models and database functions for games db."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from passlib.hash import pbkdf2_sha256

# create ORM object to interact with db
db = SQLAlchemy()

############################# Data Model #############################

class User(db.Model):
    """User class"""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True)
    password_token = db.Column(db.String(256))
    avatar = db.Column(db.String(256), default="../static/img/bowie_ipsum.jpg") # store relative path to user-avatar

    ## add relation Games
    games = db.relationship('Game')

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by id"""

        return User.query.get(user_id)

    @staticmethod
    def get_guest_user():
        """Get or create guest user"""

        guest = User.query.filter_by(username="guest").first()

        if guest == None:
            guest = User(username="guest",
                        password_token=pbkdf2_sha256.hash("password"))
            db.session.add(guest)
            db.session.commit()

        return guest


    @staticmethod
    def create_user(username, password, avatar):
        """Create new user"""

     # check if user already in DB, if not - add him

        user = User.query.filter_by(username=username).first()

        if not user:
            # encrypt password with salted hash
            password_token = pbkdf2_sha256.hash(password)

            user = User(username=username,
                        password_token=password_token,
                        avatar=avatar)


            db.session.add(user)
            db.session.commit()

            return user


    @staticmethod
    def get_user_by_credentials(username, password):
        """Get user by credentials"""

        user = User.query.filter_by(username=username).first()

        if (user != None) and pbkdf2_sha256.verify(password, user.password_token):
            return user
             # function returns None by default

class Game(db.Model):
    """Game class"""

    __tablename__ = "games"

    game_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    # stats when finished - scores, level, lives-left  - csv
    game_stats = db.Column(db.String(256), default="SAVED")
    # add column for Canvas Capture Img
    last_saving = db.Column(db.JSON, default=None) # or {}
    t_stamp = db.Column(db.DateTime, default=datetime.now())
    #  add level information to game

    # Add create game and return saved game from Game

    @staticmethod
    def create_game(current_user, data):
        """Creates and returns new game object """

        game = Game(user_id=current_user,
                    last_saving=data)
        db.session.add(game)
        db.session.commit()

        return game

    @staticmethod
    def get_game_by_id(game_id):
        """Returns game by game_id """

        return Game.query.get(game_id)


class Session(db.Model):
    """Session class to keep track of user interactions with existing games"""

    __tablename__ = "sessions"

    session_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    t_stamp = db.Column(db.DateTime)


############################# Helper Functions #############################

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
