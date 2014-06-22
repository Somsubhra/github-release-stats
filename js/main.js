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
        repoNames.push(item.name);
    });
    var autoComplete = $('#repository').typeahead();
    autoComplete.data('typeahead').source = repoNames;
}

function getStatsPressedCB(response) {
    var data = response.data;
    console.log(data);

    var err = false;
    var errMessage = '';

    if(data.message == "Not Found") {
        err = true;
        errMessage = "The project does not exist!";
    }
    if(data.length == 0) {
        err = true;
        errMessage = "There are no releases for this project";
    }

    var html = '';

    if(err) {
        html = "<div class='col-md-6 col-md-offset-3 error'>" + errMessage + "</div>";

    } else {
        html += "<div class='col-md-6 col-md-offset-3'>";
        var latest = true;
        $.each(data, function(index, item) {
            var releaseTag = item.tag_name;
            var releaseURL = item.html_url;
            if(latest) {
                html += "<div class='row release latest-release'>" +
                    "<h2><a href='" + releaseURL + "' target='_blank'>" +
                    "Latest Release: " + releaseTag +
                    "</a></h2><hr class='latest-release-hr'>" +
                    "</div>";
                latest = false;
            } else {
                html += "<div class='row release'>" +
                    "<h4><a href='" + releaseURL + "' target='_blank'>" +
                    releaseTag +
                    "</a></h4><hr class='release-hr'>" +
                    "</div>";
            }
        });
        html += "</div>";
    }

    var resultDiv = $("#stats-result");
    resultDiv.hide();
    resultDiv.html(html);
    resultDiv.slideDown();
}

// The main function
$(function() {
    validateInput();
    $("#username, #repository").keyup(validateInput);

    $("#username").change(function() {
        var user = $("#username").val();
        callGHAPI("users/" + user + "/repos", "getUserReposCB");
    });

    $("#get-stats-button").click(function() {
        var user = $("#username").val();
        var repository = $("#repository").val();
        callGHAPI("repos/" + user + "/" + repository + "/releases", "getStatsPressedCB");
    });
});
