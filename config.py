import os

from setup import basedir


class BaseConfig(object):
    MONGODB_SETTINGS = {
        # 'USERNAME': None,
        # 'PASSWORD': None,
        # 'HOST': None,
        # 'PORT': None
        'DB': 'demo_db'
    }
    SECRET_KEY = "SO_SECURE"
    DEBUG = True

    # connection string: mongodb://localhost/mydb

class TestingConfig(object):
    """Development configuration."""
    TESTING = True
    DEBUG = True
    WTF_CSRF_ENABLED = False
    DEBUG_TB_ENABLED = True
    PRESERVE_CONTEXT_ON_EXCEPTION = False
