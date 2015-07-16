//return true if every element in subArray exists within mainArray
function arrayContainsArray(mainArray, subArray) {
    var result = true;
    $.each(subArray, function (i, subItem) {
        if (mainArray.indexOf(subItem) < 0)
            result = false;
    })
    return result;
};

//retrieve an item from an array where the specified property matches the id passed in
function selectItemFromArray(id, array, idParamName, caseInsensitive) {
    var result = null;

    if (caseInsensitive) {
        var upperId = id.toUpperCase();
        $.each(array, function (i, item) {
            if (item[idParamName].toUpperCase() == upperId)
                result = item;
        });
    } else {
        $.each(array, function (i, item) {
            if (item[idParamName] == id)
                result = item;
        });
    }
    return result;
}

//remove the specified item from the array
function removeItemFromArray(item, array) {
    var index = array.indexOf(item);
    
    if (index >= 0)
        array.splice(index, 1);

    return array;
}