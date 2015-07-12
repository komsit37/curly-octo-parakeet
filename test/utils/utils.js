var should = require('../test-lib/chai-should');
var utils = require('../../lib/utils');

describe('Utils', function () {
    it('convert_accented_characters', function () {
        utils.convert_accented_characters('Shintomi, Chuo-Ku (Chūō District)')
                            .should.equal('Shintomi, Chuo-Ku (Chuo District)');
    });
});