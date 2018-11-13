import hashlib
import hmac
import requests
import json
from rijndael.cipher import crypt
from rijndael.cipher.blockcipher import MODE_CBC


class IrapApiClient(object):
    api_host_path = 'https://api.vida.irap.org'
    api_version = '1.0'

    broker_id = None
    broker_token = None
    broker_key = None

    # Used as a result of authenticating
    user_auth_id = None
    user_token = None
    user_key = None
    user_id = None

    def __init__(self, broker_id, broker_token, broker_key):
        self.broker_id = broker_id
        self.broker_token = broker_token
        self.broker_key = broker_key

    def _user_authenticated(self):
        return self.user_auth_id is not None

    def _generate_headers(self):
        headers = {
            'auth_nonce': None,
            'auth_timestamp': None,
            'auth_system_auth_id': self.broker_id,
            'auth_system_public_key': self.broker_token
        }
        if self._user_authenticated():
            headers.update({
                'auth_user_auth_id': self.user_auth_id,
                'auth_user_public_key': self.user_token
            })

        return headers

    def _build_url(self, resource, id=None, args=None, filter=None):
        return '/'.join(self.api_host_path, self.api_version, resource)

    def _sign_request(self, request):
        # Calculate the broker key's signature now, but don't add it to the headers
        # until after we do the user signature (If we do)
        broker_signature = request.create_signature(self.broker_key)

        if self._user_authenticated():
            user_signature = self.create_signature(self.user_key)
            request.headers['auth_user_signature'] = user_signature

        request.headers['auth_system_signature'] = broker_signature

    def _create_request(self, url, payload=None):
        request = IrapApiRequest()
        request.url = url
        request.payload = payload
        request.headers = self._generate_headers()

        self._sign_request(request)

        return request

    def authenticate(self, email, password):
        def encrypt_secret(secret, key):
            md5key = hashlib.md5(key).digest()

            cipher = crypt.new(
                key=md5key,
                mode=MODE_CBC,
                IV=hashlib.md5(md5key).digest()
            )
            return cipher.encrypt(secret)

        url = self._build_url('auth/register')
        payload = {
            "email": email,
            "password": encrypt_secret(password, self.broker_key)
        }
        request = self._create_request(url, payload)
        response = request.post()

        self.user_auth_id = response['auth_id']
        self.user_token = response['api_key']
        self.user_key = response['api_secret']
        self.user_id = response['user_id']


class IrapApiRequest(object):
    headers = {}
    payload = None
    url = None

    def create_signature(self, key):
        parameters = dict(self.headers, auth_url=self.url)
        if self.payload:
            parameters.update(self.payload)

        # Convert all keys to lower case
        lowercase_keys = {(key.lower(), value) for key, value in parameters.iteritems()}
        # Make sure to sort keys alphabetically
        json_dump = json.dumps(lowercase_keys, sort_keys=True)
        hmac_hash = hmac.new(key, json_dump, digestmod=hashlib.sha256).digest()
        return hmac_hash

    def post(self):
        response = requests.post(self.url, data=self.payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

