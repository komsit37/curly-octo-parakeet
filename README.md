#curly-octo-parakeet
[![Build Status](https://travis-ci.org/komsit37/curly-octo-parakeet.svg?branch=master)](https://travis-ci.org/komsit37/curly-octo-parakeet)


###Feature
there is rate limit built-in separately within each api call

###Run
```
node crawl/crawl_search.js
node crawl/crawl_room_calendar.js
```

###Test
```
npm test
```

###Requires
**secret.js**
```javascript
module.exports.ELASTICSEARCH_HOST = 'http://user:pass@eee.com';
```
config/default.json