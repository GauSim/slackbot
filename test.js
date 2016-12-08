var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: false });

function testing() {
    nightmare
        .goto('http://yahoo.com')
        .type('form[action*="/search"] [name=p]', 'simon')
        .click('form[action*="/search"] [type=submit]')
        .wait('#main')
        .evaluate(function () {
            return document.querySelector('#main .searchCenterMiddle li a').href
        })
        .end()
        .then(function (result) {
            console.log('nightmare', result)
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
}

module.exports = {
    testing: testing
}