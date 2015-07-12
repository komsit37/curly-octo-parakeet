#!/usr/bin/env bash
#use this interactively with shell REPL, can set shell highlight to javascript
cheerio https://www.airbnb.com/rooms/3266217

var path = require('path')
var u = require('underscore')

r = {}

r['listing_id'] = $('#hosting_id').attr('value')
r['listing_name'] = $('#listing_name').text().trim()

r['default_price'] = $('#pricing meta[itemprop="price"]').attr('content')
r['default_price_currency'] = $('#pricing meta[itemprop="priceCurrency"]').attr('content')

r['host_id'] = path.basename($('li.user-image a').attr('href'))
r['host_name'] = $('li.user-image a img').attr('title')

map = $('#map').data()
r['map_lat'] = map.lat
r['map_lng'] = map.lng

r['last_updated'] = new Date()

wish = $('.wish_list_button').data()
r['img'] = wish.img
r['address'] = wish.address

saved = $('.wish_list_button').attr('title')	//todo: handle no wishlist case
try{saved = parseInt(saved.match(/\d+/g)[0])} catch(e) {saved = 0}	//this will throw error if no match, or match is not a number
r['wishlist'] = saved

#summary > div > div > div.col-lg-8 > div > div:nth-child(1) > div.col-md-9 > div.row.row-condensed.text-muted.text-center > div:nth-child(1) > i
$('#summary div.col-sm-3 i.icon').first().clone().removeClass('icon icon-size-2').attr('class').replace("icon-", "")
ty = $('#summary div.col-sm-3 i.icon').first().attr('class')
ty.replace(/icon|size|\d|-/g, "").trim()

$('meta[property="airbedandbreakfast:region"]').attr('content')
$('meta[property="airbedandbreakfast:country"]').attr('content')
$('meta[property="airbedandbreakfast:city"]').attr('content')
$('meta[property="airbedandbreakfast:rating"]').attr('content')
$('meta[property="airbedandbreakfast:fff"]').attr('content')
 content="35.68461750451583">
r
['region', 'country'].forEach(function(e){r[e] = $('meta[property="airbedandbreakfast:' + e + '"]').attr('content')})