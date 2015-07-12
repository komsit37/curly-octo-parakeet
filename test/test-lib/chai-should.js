//simplify importing test libs, test only needs to include this file
//@usage
//var should = require('../test-lib/chai-should');

var chai = require("chai");
chai.use(require('chai-fuzzy'));
var should = chai.should();

module.exports = should;