//used by services after calling an API, to make sure that there is always a default error handler on every promise
var servicePromiseProcessing = function (callPromise) {
    callPromise.catch(function (response) {
        console.log("Un-Caught Error: " + JSON.stringify(response));
    });
};