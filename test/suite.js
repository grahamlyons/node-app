var litmus = require('litmus');

exports.test = new litmus.Suite('description', [
    require('./a-test.js').test,
    require('./view-test.js').test
]);
