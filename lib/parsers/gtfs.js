var protobuf = require('protobufjs');
var path = require('path');

module.exports = function (res) {
  var file = path.resolve(__dirname + '/../data/proto/nyct-subway.proto');
  return new Promise(function (resolve, reject) {
    protobuf.load(file, function(err, root) {
      if(err)
        throw err;

    // var builder = root.build('transit_realtime');

      var data = [];

      res.body.on('data', function (chunk) {
        data.push(chunk);
      });

      res.body.on('error', function (error) {
        reject(error);
      });

      res.body.on('end', function () {
        var decodedData;
        data = Buffer.concat(data);

        if (data.length < 1) {
          return reject(new Error('Empty response.'));
        }

        var FeedMessage = root.lookupType("FeedMessage");

        // added this to handle random malformed responses from API
        try {
          decodedData = FeedMessage.decode(data);
        } catch (error) {
          console.log(error);
          reject(error);
        }

        resolve(decodedData);
      });
    });
  });
};
