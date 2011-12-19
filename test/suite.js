var litmus = require('litmus');

exports.test = new litmus.Suite('Testing promises, views and framework', [
    require('./a-test.js').test,
    require('./view-test.js').test,
    require('./nano-test.js').test
]);
