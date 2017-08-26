# Deploying Play-Play on a Raspberry Pi

This guide is based on Digital Ocean's article: https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uwsgi-and-nginx-on-ubuntu-16-04

Refer to that for more details to why things are done. This document mainly document the steps required to configure Nginx + uWSGI + Flask on a Pi.

## Update the System

    sudo apt-get update
    sudo apt-get upgrade

## Install Dependencies

    sudo apt-get update
    sudo apt-get install python3-pip python3-dev nginx

## Clone the project

    mkdir ~/code
    cd ~/code
    git clone https://github.com/thomthom/play-play.git

## Create a Python Virtual Environment

    sudo pip3 install virtualenv

    virtualenv playplayenv

    source playplayenv/bin/activate

## Install Flask App

    pip install --editable .
    export FLASK_APP=playplay
    flask initdb

### Testing Flask App (Optional)

#### Locally

    flask run --host=0.0.0.0

App can be accessed from: http://localhost:5000/

#### Network

    flask run --host=0.0.0.0

  App can be accessed from: http://<local-ip-address>:5000/

## Configure uWSGI

### Testing uWSGI Serving

    uwsgi --socket 0.0.0.0:5000 --protocol=http -w playplay:app

App can be accessed from: http://localhost:5000/

Deactivate the virtual environment:

    deactivate

## Create a systemd Unit File

Create file: `/etc/systemd/system/playplay.service`

    [Unit]
    Description=uWSGI instance to serve Play-Play
    After=network.target

    [Service]
    User=sammy
    Group=www-data
    WorkingDirectory=/home/pi/code/play-play
    Environment="PATH=/home/pi/code/play-play/playplayenv/bin"
    ExecStart=/home/pi/code/play-play/playplayenv/bin/uwsgi --ini playplay.ini

    [Install]
    WantedBy=multi-user.target

Restart and enable uWSGI

    sudo systemctl start playplay
    sudo systemctl enable playplay

## Configuring Nginx to Proxy Requests

Create file: `/etc/nginx/sites-available/myproject`

    server {
        listen 80;
        server_name localhost;

        location / {
            include uwsgi_params;
            uwsgi_pass unix:/home/pi/code/play-play/playplay.sock;
        }
    }

Remove default site:

    sudo rm /etc/nginx/sites-enabled/default

Enable Play-Play site:

    sudo ln -s /etc/nginx/sites-available/playplay /etc/nginx/sites-enabled

Test config:

    sudo nginx -t

Restart Nginx

    sudo systemctl restart nginx
