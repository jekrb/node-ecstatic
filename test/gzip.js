var test = require('tap').test,
    ecstatic = require('../lib/ecstatic'),
    http = require('http'),
    request = require('request'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    zlib = require('zlib')

var root = __dirname + '/public',
    baseDir = 'base';

mkdirp.sync(root + '/emptyDir');

var cases = require('./fixtures/common-cases'),
    file = 'a.txt';

test('gzip', function (t) {
  var port = Math.floor(Math.random() * ((1<<16) - 1e4) + 1e4);
  var server = http.createServer(
    ecstatic({
      root: root,
      gzip: true,
      baseDir: baseDir,
      autoIndex: true,
      showDir: true,
      defaultExt: 'html',
      handleError: true
    })
  );

  server.listen(port, function () {
    var uri = 'http://localhost:' + port + path.join('/', baseDir, file),
        headers = cases[file].headers || {};

    request({
      uri: uri,
      followRedirect: false,
      headers: headers,
      gzip: true
    }, function (err, res, body) {
      if (err) t.fail(err);
      zlib.gzip(cases[file].body, function (err, data) {
        if (err) t.fail(err)
        t.equal(res.headers['content-encoding'], 'gzip')
        server.close();
        t.end();
      });
    });
  });
});
