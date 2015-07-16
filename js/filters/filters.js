'use strict';


//filter used for pagination (Angular already has a buil-in limitTo filter)
qdmpApp.filter('startFrom', function () {
    return function (input, start) {
        if (!input)
            return [];

        start = +start; //parse to int
        return input.slice(start);
    }
});