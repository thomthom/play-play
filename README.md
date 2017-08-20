# Play-Play

## What is Play-Play?

A board for listing past present and future games being played.

## How do I use it?

1. Edit the configuration in the playplay.py file or
    export an PLAYPLAY_SETTINGS environment variable
    pointing to a configuration file.

2. Install the app from the root of the project directory

       pip install --editable .

3. Instruct flask to use the right application

   *nix

       export FLASK_APP=playplay

   Windows:

       set FLASK_APP=playplay

4. Initialize the database with this command:

       flask initdb

5. Now you can run Play-Play:

       flask run

    the application will greet you on
    http://localhost:5000/
