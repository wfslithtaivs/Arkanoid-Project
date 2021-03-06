"""Models and database functions for games db."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from passlib.hash import pbkdf2_sha256
from sqlalchemy import func

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


    @staticmethod
    def get_best_score():
        """Get best score among users"""

        best_score = db.session.query(func.max(Game.score)).filter(Game.status == "won").first()
        score_user = db.session.query(Game.score, User.username).join(User).filter(Game.score == best_score, Game.status == "won").first()

        return score_user


    @staticmethod
    def get_best_time():
        """Get best time among users"""

        #  Always remember about db.session.rollback() when debugging

        max_timing = db.session.query(func.min(Game.timing)).filter(Game.status == "won").first()
        time_user = db.session.query(Game.timing, User.username).join(User).filter(Game.timing == max_timing, Game.status == "won").first()

        return time_user


    def get_best_score_and_time(self):
        """ Get bast score and time for user"""

        best_time = 10000
        best_score = 0

        for game in self.games:
            if game.status == "won":
                if best_time > game.timing:
                    best_time = game.timing
                if best_score < game.score:
                    best_score = game.score

        if best_time == 10000:
            best_time = 0

        return (best_score, best_time)


class Game(db.Model):
    """Game class"""

    __tablename__ = "games"

    game_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    last_saving = db.Column(db.JSON, default=None) # or {}
    status = db.Column(db.String(256))
    timing = db.Column(db.Integer)
    score = db.Column(db.Integer)

    t_stamp = db.Column(db.DateTime, default=datetime.now())

    # Add create game and return saved game from Game

    @staticmethod
    def create_game(current_user, data):
        """Creates and returns new game object """

        game = Game(user_id=current_user,
                    last_saving=data,
                    status=data["status"],
                    timing=data["timing"],
                    score=data["score"])

        db.session.add(game)
        db.session.commit()

        return game

    @staticmethod
    def get_game_by_id(game_id):
        """Returns game by game_id """

        return Game.query.get(game_id)

    @staticmethod
    def delete_game(game_id):
        """Delete game by id"""

        game = Game.query.get(game_id)
        db.session.delete(game)
        db.session.commit()

############################# Helper Functions #############################

def init_app():
    from flask import Flask
    app = Flask(__name__)
    connect_to_db(app)
    print "Connected to DB."


def connect_to_db(app, db_uri="postgresql:///games"):
    """Connect the database to Flask app."""

    # Configure to use our database
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    # Print in log corresponding SQL queries
    app.config['SQLALCHEMY_ECHO'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Link db to flask application
    db.app = app
    db.init_app(app)

def example_data():
    """Create some sample data."""

    User.create_user("Kate", "longpass", None)
    User.create_user("Long", "regularpass", None)
    User.create_user("Critter", "shortpass", None)

if __name__ == "__main__":
    from flask import Flask
    app = Flask(__name__)
    connect_to_db(app)
    print "Connected to DB."
