module.exports = ({ env }) => ({
  connection: env('DATABASE_URL')
    ? {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          ssl: env.bool('DATABASE_SSL', false) && {
            key: env('DATABASE_SSL_KEY'),
            cert: env('DATABASE_SSL_CERT'),
            ca: env('DATABASE_SSL_CA'),
            capath: env('DATABASE_SSL_CAPATH'),
            cipher: env('DATABASE_SSL_CIPHER'),
            rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
          },
        },
        debug: false,
      }
    : {
        client: 'sqlite',
        connection: {
          filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        },
        debug: false,
      },
});