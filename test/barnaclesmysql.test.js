/**
 * Copyright reelyActive 2015-2020
 * We believe in an open Internet of Things
 */

const assert = require('assert');
const BarnaclesMySQL = require('../lib/barnaclesmysql.js');

describe('createMySQLConnection', function () {
  it('Should throw an error if user and password are not provided', function () {
    assert.throws(() => {
      const instance = new BarnaclesMySQL({});
      instance.createMySQLConnection({});
    }, /MySQL `user` and `password` must be provided/);
  });
});
