import sys
import os

import click
from jinja2 import Environment, FileSystemLoader
import secrets

FILE_PATH = os.path.dirname(os.path.abspath(__file__))
PROJECT_PATH = os.path.abspath(os.path.join(FILE_PATH, os.path.pardir))
TEMPLATE_PATH = 'deployment/ansible/group_vars'
TEMPLATE_FILENAME = 'production.j2'
OUTPUT_FILENAME = 'production'

TEMPLATE_ENVIRONMENT = Environment(
    autoescape=False,
    loader=FileSystemLoader(os.path.join(PROJECT_PATH, TEMPLATE_PATH)),
    trim_blocks=False)


def render_template(context):
    return TEMPLATE_ENVIRONMENT.get_template(TEMPLATE_FILENAME).render(context)


def generate_password():
    return secrets.token_urlsafe(32)


def wrap_in_quotes(s):
    return '"{}"'.format(s)


@click.command()
@click.option(
    '--app_domain_name',
    prompt='App domain name (without http:// or https://)',
)
@click.option(
    '--database_server_ip',
    prompt='Database server IP',
)
@click.option(
    '--app_server_ip',
    prompt='App server IP',
)
@click.option(
    '--celery_server_ip',
    prompt='Celery server IP',
)
def create_production_group_vars(
        app_domain_name, database_server_ip, app_server_ip, celery_server_ip):

    context = {
        'app_domain_name': wrap_in_quotes(app_domain_name),
        'database_server_ip': wrap_in_quotes(database_server_ip),
        'app_server_ip': wrap_in_quotes(app_server_ip),
        'celery_server_ip': wrap_in_quotes(celery_server_ip),
        'postgresql_password': wrap_in_quotes(generate_password()),
        'windshaft_db_password': wrap_in_quotes(generate_password()),
        'heimdall_db_password': wrap_in_quotes(generate_password()),
        'csrf_session_key': wrap_in_quotes(generate_password()),
        'cookie_secret_key': wrap_in_quotes(generate_password()),
    }

    with open(os.path.join(TEMPLATE_PATH, OUTPUT_FILENAME), 'w') as f:
        group_vars = render_template(context)
        f.write(group_vars)

    # TODO: Write inventory file

if __name__ == '__main__':
    create_production_group_vars()
