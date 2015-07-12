const requiredFields = [
    'listing_name',
    'host_id',
    'host_name',
    'rent_type',
    'default_price',
    'default_price_currency',
    'map_lat',
    'map_lng',
    'img',
    'address',
    'id',
    'wishlist',
    'property_type',
    'accommodates',
    'bedrooms',
    'bathrooms',
    'beds',
    'cancellation',
    'region',
    'country',
    'city',
    'reviews',
    'response_rate',
    'response_time'
];

const optionalFields = [
    'bed_type',
    'extra_people',
    'weekly_price',
    'rating',
    'rating_accuracy',
    'rating_communication',
    'rating_cleanliness',
    'rating_location',
    'rating_check_in',
    'rating_value'
];

const digitFields = [
    'accommodates',
    'bathrooms',
    'bedrooms',
    'beds',
    'cleaning_fee',
    'default_price',
    'min_stay',
    'weekly_price',
    'reviews',
    'security_deposit',
    'wishlist'
];

module.exports.requiredFields = requiredFields;
module.exports.optionalFields = optionalFields;
module.exports.digitFields = digitFields;