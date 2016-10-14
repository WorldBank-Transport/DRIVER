from django.test import TestCase


class TrueTestCase(TestCase):

    def test_true(self):
        self.assertTrue(True)