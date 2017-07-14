from unittest import TestCase
from model import User, Game, connect_to_db, db, example_data
from server import app
import server


class FlaskTests(TestCase):
    def setUp(self):
        """Stuff to do before every test."""

        # Get the Flask test client
        self.client = app.test_client()

        # Show Flask errors that happen during tests
        app.config['TESTING'] = True

        # Connect to test database
        # connect_to_db(app, "postgresql:///games")
        connect_to_db(app)

        # Create tables and add sample data
        db.create_all()
        # example_data()

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

if __name__ == "__main__":
    import unittest

    unittest.main()
