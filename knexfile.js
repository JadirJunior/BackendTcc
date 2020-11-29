const config = require('./src/config/databaseConfig.json');

module.exports = {
    development: {
        client: 'mssql',
        connection: {
            server: config.server,
            user: config.user,
            password: config.password,
            database: config.database,
            options: {
                encrypt: false,
                enableArithAbout: true
            }
        }
    }
}