def init_app(app):
    # Only import and register the route modules that exist in this
    # starter repository. User and auth routes were intentionally omitted
    # when opting out of built-in Firebase auth.
    from . import (
        entity_routes,
        simple_entity_routes,
        documentation_routes,
    )

    app.register_blueprint(entity_routes.blueprint)
    app.register_blueprint(simple_entity_routes.blueprint)
    app.register_blueprint(documentation_routes.blueprint)
