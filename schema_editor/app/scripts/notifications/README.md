# Notifications module

Allows the broadcast and display of global notifications.

## Usage

1. Place a `<ase-notifications></ase-notifications` tag wherever you want notifications
to appear. Remember that all notifications are global so this tag may display notifications
from other parts of the app.
2. Require the `Notifications` module and then call `Notifications.show(opts)` where opts
is an Object with options for the new alert (info / warning / error status, timeout, etc.).
Default values are generated in notifications-service.js for any missing options.

## Limitations

- Only one notification may be active at a time; subsequent notifications will override it.
- Different notifications may not be sent to different instances of the directive; all
notifications are global.
