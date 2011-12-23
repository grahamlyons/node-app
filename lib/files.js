var fs = require('fs'),
    crypto = require('crypto');

/**
 * Returns the MD5 hash of the input
 * @param content
 * @return string
 */
function md5Hash(content) {
    var hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
}

/**
 * Object for caching file contents
 */
var cache = {};

/**
 * Get a file, either from disk or from cache.
 * @param string filepath
 * @param function callback
 */
function getFile(filepath, callback) {

    var hash = md5Hash(filepath);

    if(cache[hash]) {
        callback(null, cache[hash]);
    }
    else {
        fs.readFile(filepath, function(err, data) {
            if(!err) {
                cache[hash] = data;
            }
            callback(err, data);
        });
    }

}

exports.md5Hash = md5Hash;
exports.getFile = getFile;
