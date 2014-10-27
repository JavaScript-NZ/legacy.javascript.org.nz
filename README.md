# javascript.org.nz

## Development

This is built using [KeystoneJS](http://keystonejs.com/).

To get this running, you at least need a MongoDB instance running.

## Configuration

In addition to the services configuration options, the following optional environment variables are used:

    MAINTENANCE_ENABLED

If this is 'true', the site is put into maintenance mode, with only the maintenance placeholder page accessible.
Administrators are still able to access the site normally.

    MAINTENANCE_MSG

The message to be shown on the maintenance page.

## Services

The sites uses some external services. These are setup to use dummy configuration values by default. To use them, you need to set their config options either as environment variables or in a ```.env``` file in the root of the repo.

### Cloudinary

[Cloudinary](http://cloudinary.com/) is used for image hosting an manipulation.

    CLOUDINARY_URL=cloudinary://user:key@domain

### Mandrill

[Mandrill](http://mandrill.com) is used for sending email.

    MANDRILL_API_KEY=key
    MANDRILL_USERNAME=user
