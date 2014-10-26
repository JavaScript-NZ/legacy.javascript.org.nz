# javascript.org.nz

## Development

This is built using [KeystoneJS](http://keystonejs.com/).

To get this running, you at least need a MongoDB instance running.

### Services

The sites uses some exernal services. These are setup to use dummy configuration values by default. To use them, you need to set their config options eiter as environment variables or in a .env file in the root of the repo.

#### [Cloudinary](http://cloudinary.com/)

    CLOUDINARY_URL=cloudinary://user:key@domain

#### [Mandrill](http://mandrill.com)

    MANDRILL_API_KEY=key
    MANDRILL_USERNAME=user
