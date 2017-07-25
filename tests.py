from unittest import TestCase
from model import User, Game, connect_to_db, db, example_data
from server import app
import server
from random import choice


class FlaskTests(TestCase):
    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()

        # Show Flask errors that happen during tests
        app.config['TESTING'] = True

        # Connect to test database
        connect_to_db(app, "postgresql:///tests")
        connect_to_db(app)

        # Create tables and add sample data
        db.create_all()
        example_data()


    def tearDown(self):
        """Do at end of every test."""

        db.session.close()
        db.drop_all()


    def test_guest_user_name(self):
        """Can we get guest user name from db?"""

        guest = User.get_guest_user()
        self.assertEqual(guest.username, "guest")


    def test_get_guest_user_by_credentials(self):
        """Find guest user by credentials."""

        User.get_guest_user() # user should exists

        guest = User.get_user_by_credentials("guest", "password")
        self.assertIn(guest.username, "guest")


    def test_get_user_by_id(self):
        """Get user by given ID """

        users = User.query.all()
        random_user = users[choice(range(len(users) - 1))]

        self.assertEqual(random_user, User.query.get(random_user.user_id))

    
    def test_create_user(self):
        """Create user """

        user = User.create_user("SomeUser", "somepassword", None)
        self.assertEqual(user.username, User.query.get(user.user_id).username)

    
    def test_get_best_score(self):
        """Get best score over users"""

    
    def test_get_best_time(self):
        """ Get best time"""


    def test_get_best_score_and_time(self):
        """Get best score and time """

    
    def test_create_game(self):
        """ Create game"""

    
    def test_get_game_by_id(self):
        """ Get game by id"""


    def test_delete_game(self):
        """Delete game """

    
if __name__ == "__main__":
    import unittest

    unittest.main()
