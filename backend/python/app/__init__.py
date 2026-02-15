import os
import re

from flask import Flask
from flask.cli import ScriptInfo
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from logging.config import dictConfig

from .config import app_config


def create_app(config_name):
    # configure Flask logger
    dictConfig(
        {
            "version": 1,
            "handlers": {
                "wsgi": {
                    "class": "logging.FileHandler",
                    "level": "ERROR",
                    "filename": "error.log",
                    "formatter": "default",
                }
            },
            "formatters": {
                "default": {
                    "format": "%(asctime)s-%(levelname)s-%(name)s::%(module)s,%(lineno)s: %(message)s"
                },
            },
            "root": {"level": "ERROR", "handlers": ["wsgi"]},
        }
    )

    app = Flask(__name__, template_folder="templates", static_folder="static")
    # do not read config object if creating app from Flask CLI (e.g. flask db migrate)
    if type(config_name) is not ScriptInfo:
        app.config.from_object(app_config[config_name])

    app.config["CORS_ORIGINS"] = [
        "http://localhost:3000",
        "https://uw-blueprint-starter-code.firebaseapp.com",
        "https://uw-blueprint-starter-code.web.app",
        re.compile("^https:\/\/uw-blueprint-starter-code--pr.*\.web\.app$"),
    ]
    app.config["CORS_SUPPORTS_CREDENTIALS"] = True
    CORS(app)

    if os.getenv("FLASK_CONFIG") != "production":
        app.config["SQLALCHEMY_DATABASE_URI"] = (
            "postgresql://{username}:{password}@{host}:5432/{db}".format(
                username=os.getenv("POSTGRES_USER"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host=os.getenv("DB_HOST"),
                db=(
                    os.getenv("POSTGRES_DB_TEST")
                    if app.config["TESTING"]
                    else os.getenv("POSTGRES_DB_DEV")
                ),
            )
        )
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    from . import models, rest

    models.init_app(app)
    rest.init_app(app)

    return app
