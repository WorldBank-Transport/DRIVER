import sys
import os

import click
from jinja2 import Environment, FileSystemLoader
import secrets

FILE_PATH = os.path.dirname(os.path.abspath(__file__))
PROJECT_PATH = os.path.abspath(os.path.join(FILE_PATH, os.path.pardir))
GROUP_VARS_PATH = 'deployment/ansible/group_vars'
GROUP_VARS_TEMPLATE_FILENAME = 'production.j2'
GROUP_VARS_FILENAME = 'production'
INVENTORY_PATH = 'deployment/ansible/inventory'
INVENTORY_TEMPLATE_FILENAME = 'production.j2'
INVENTORY_FILENAME = 'production'


def render_template(template_path, template_filename, context):
    template_environment = Environment(
        loader=FileSystemLoader(template_path),
        trim_blocks=True
    )
    return template_environment.get_template(template_filename).render(context)


def generate_password():
    return secrets.token_urlsafe(32)


@click.command()
@click.option(
    '--app_domain_name',
    prompt='App domain name (without http:// or https://)',
)
@click.option(
    '--database_server_public_ip',
    prompt='Database server IP (public)',
)
@click.option(
    '--app_server_public_ip',
    prompt='App server IP (public)',
)
@click.option(
    '--celery_server_public_ip',
    prompt='Celery server IP (public)',
)
@click.option(
    '--database_server_ip',
    default='',
    prompt='Database server IP (private, leave blank if n/a)',
)
@click.option(
    '--app_server_ip',
    default='',
    prompt='App server IP (private, leave blank if n/a)',
)
@click.option(
    '--celery_server_ip',
    default='',
    prompt='Celery server IP (private, leave blank if n/a)',
)
def create_files_for_deployment(
        app_domain_name,
        database_server_public_ip,
        app_server_public_ip,
        celery_server_public_ip,
        database_server_ip,
        app_server_ip,
        celery_server_ip,
    ):

    with open(os.path.join(GROUP_VARS_PATH, GROUP_VARS_FILENAME), 'w') as f:
        group_vars = render_template(
            os.path.join(PROJECT_PATH, GROUP_VARS_PATH),
            GROUP_VARS_TEMPLATE_FILENAME,
            {
                'database_server_ip': database_server_ip or database_server_public_ip,
                'app_server_ip': app_server_ip or app_server_public_ip,
                'celery_server_ip': celery_server_ip or celery_server_public_ip,
                'app_domain_name': app_domain_name,
                'postgresql_password': generate_password(),
                'windshaft_db_password': generate_password(),
                'heimdall_db_password': generate_password(),
                'csrf_session_key': generate_password(),
                'cookie_secret_key': generate_password(),
                'driver_admin_password': generate_password(),
            }
        )
        f.write(group_vars)
        print('New group_vars file written to: {}'.format(
            os.path.join(PROJECT_PATH, GROUP_VARS_PATH, GROUP_VARS_FILENAME)))

    with open(os.path.join(INVENTORY_PATH, INVENTORY_FILENAME), 'w') as f:
        inventory = render_template(
            os.path.join(PROJECT_PATH, INVENTORY_PATH),
            INVENTORY_TEMPLATE_FILENAME,
            {
                'database_server_public_ip': database_server_public_ip,
                'app_server_public_ip': app_server_public_ip,
                'celery_server_public_ip': celery_server_public_ip,
            }
        )
        f.write(inventory)
        print('New inventory file written to: {}'.format(
            os.path.join(PROJECT_PATH, INVENTORY_PATH, INVENTORY_FILENAME)))


if __name__ == '__main__':
    create_files_for_deployment()
