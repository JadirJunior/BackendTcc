const azure = require('azure-storage');
const config = require('../config/azureConfig');
const fs = require('fs');
const path = require('path');
module.exports = {
    upload: async (file) => {
      var bitmap = fs.readFileSync(path.resolve(__dirname, '..', '..', 'uploads', file.filename));
      var buffer = new Buffer(bitmap, 'base64');
      const blobsvc = azure.createBlobService(config.connection_string);
      await blobsvc.createBlockBlobFromText('images', file.filename, buffer, {
        contentSettings: file.mimetype.split('/')[1]
      }, (error, result, response) => {
        if (error) {
          return res.json({error: 'Ocorreu um erro inesperado, tente novamente.'})
        }
      });
    },
}