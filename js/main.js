// Github API call according to their json-p dox
function callGHAPI(url, callback) {
    var apiRoot = "https://api.github.com/";
    var script = document.createElement("script");
    script.src = apiRoot + url + "?callback=" + callback;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// validate the user input
function validateInput() {
    if ($("#username").val().length > 0 && $("#repository").val().length > 0) {
        $("#get-stats-button").prop("disabled", false);
    }
    else {
        $("#get-stats-button").prop("disabled", true);
    }
}

// Callback function for getting user repositories
function getUserReposCB(response) {
    var data = response.data;
    var repoNames = [];
    $.each(data, function(index, item) {
        repoNames.push(data[index].name);
    });
    $("#repository").typeahead({source: repoNames});
}

// The main function
$(function() {
    validateInput();
    $("#username, #repository").keyup(validateInput);
    $("#username").change(function() {
        var user = $("#username").val();
        callGHAPI("users/" + user + "/repos", "getUserReposCB");
    });
});
