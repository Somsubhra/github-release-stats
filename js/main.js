var apiRoot = "https://api.github.com/";

// Return a HTTP query variable
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable) {
            return pair[1];
        }
    }
    return "";
}

// Format numbers
function formatNumber(value) {
    return value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}

// Validate the user input
function validateInput() {
    if ($("#username").val().length > 0 && $("#repository").val().length > 0) {
        $("#get-stats-button").prop("disabled", false);
    } else {
        $("#get-stats-button").prop("disabled", true);
    }
}

// Move to #repository when hit enter and if it's empty or trigger the button
$("#username").keyup(function (event) {
    if (event.keyCode === 13) {
        if (!$("#repository").val()) {
            $("#repository").focus();
        } else {
            $("#get-stats-button").click();
        }
    }
});

// Callback function for getting user repositories
function getUserRepos() {
    var user = $("#username").val();

    var autoComplete = $('#repository').typeahead({ 
        autoSelect: true,
        afterSelect: function() {
            $("#get-stats-button").click();
        }
     });
    var repoNames = [];

    var url = apiRoot + "users/" + user + "/repos";
    $.getJSON(url, function(data) {
        $.each(data, function(index, item) {
            repoNames.push(item.name);
        });
    });

    autoComplete.data('typeahead').source = repoNames;
}

// Display the stats
function showStats(data) {
    var err = false;
    var errMessage = '';

    if(data.status == 404) {
        err = true;
        errMessage = "The project does not exist!";
    }

    if(data.status == 403) {
        err = true;
        errMessage = "You've exceeded GitHub's rate limiting.<br />Please try again in about an hour.";
    }

    if(data.length == 0) {
        err = true;
        errMessage = "There are no releases for this project";
    }

    var html = "";

    if(err) {
        html += "<div class='col-md-6 col-md-offset-3 alert alert-danger output'>" + errMessage + "</div>";
    } else {
        html += "<div class='col-md-6 col-md-offset-3 output'>";

        var isLatestRelease = true;
        var totalDownloadCount = 0;
        $.each(data, function(index, item) {
            var releaseTag = item.tag_name;
            var releaseBadge = "";
            var releaseClassNames = "release";
            var releaseURL = item.html_url;
            var isPreRelease = item.prerelease;
            var releaseAssets = item.assets;
            var releaseDownloadCount = 0;
            var releaseAuthor = item.author;
            var publishDate = item.published_at.split("T")[0];

            if(isPreRelease) {
                releaseBadge = "&nbsp;&nbsp;<span class='badge'>Pre-release</span>";
                releaseClassNames += " pre-release";
            } else if(isLatestRelease) {
                releaseBadge = "&nbsp;&nbsp;<span class='badge'>Latest release</span>";
                releaseClassNames += " latest-release";
                isLatestRelease = false;
            }

            var downloadInfoHTML = "";
            if(releaseAssets.length) {
                downloadInfoHTML += "<h4><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;" +
                    "Download Info</h4>";

                downloadInfoHTML += "<ul>";

                $.each(releaseAssets, function(index, asset) {
                    var assetSize = (asset.size / 1048576.0).toFixed(2);
                    var lastUpdate = asset.updated_at.split("T")[0];

                    downloadInfoHTML += "<li><code>" + asset.name + "</code> (" + assetSize + "&nbsp;MiB) - " +
                        "downloaded " + formatNumber(asset.download_count) + "&nbsp;times. " +
                        "Last&nbsp;updated&nbsp;on&nbsp;" + lastUpdate + "</li>";

                    totalDownloadCount += asset.download_count;
                    releaseDownloadCount += asset.download_count;
                });
            }

            html += "<div class='row " + releaseClassNames + "'>";

            html += "<h3><span class='glyphicon glyphicon-tag'></span>&nbsp;&nbsp;" +
                "<a href='" + releaseURL + "' target='_blank'>" + releaseTag + "</a>" +
                releaseBadge + "</h3>" + "<hr class='release-hr'>";

            html += "<h4><span class='glyphicon glyphicon-info-sign'></span>&nbsp;&nbsp;" +
                "Release Info</h4>";

            html += "<ul>";

            if (releaseAuthor) {
                html += "<li><span class='glyphicon glyphicon-user'></span>&nbsp;&nbsp;" +
                    "Author: <a href='" + releaseAuthor.html_url + "'>@" + releaseAuthor.login  +"</a></li>";
            }

            html += "<li><span class='glyphicon glyphicon-calendar'></span>&nbsp;&nbsp;" +
                "Published: " + publishDate + "</li>";

            if(releaseDownloadCount) {
                html += "<li><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;" +
                    "Downloads: " + formatNumber(releaseDownloadCount) + "</li>";
            }

            html += "</ul>";

            html += downloadInfoHTML;

            html += "</div>";
        });

        if(totalDownloadCount) {
            var totalHTML = "<div class='row total-downloads'>";
            totalHTML += "<h1><span class='glyphicon glyphicon-download'></span>&nbsp;&nbsp;Total Downloads</h1>";
            totalHTML += "<span>" + formatNumber(totalDownloadCount) + "</span>";
            totalHTML += "</div>";

            html = totalHTML + html;
        }

        html += "</div>";
    }

    var resultDiv = $("#stats-result");
    resultDiv.hide();
    resultDiv.html(html);
    $("#loader-gif").hide();
    resultDiv.slideDown();
}

// Callback function for getting release stats
function getStats() {
    var user = $("#username").val();
    var repository = $("#repository").val();

    var url = apiRoot + "repos/" + user + "/" + repository + "/releases";
    $.getJSON(url, showStats).fail(showStats);
}

// The main function
$(function() {
    $("#loader-gif").hide();

    validateInput();
    $("#username, #repository").keyup(validateInput);

    $("#username").change(getUserRepos);

    $("#get-stats-button").click(function() {
        window.location = "?username=" + $("#username").val() +
            "&repository=" + $("#repository").val() +
            ((getQueryVariable("search") == "0") ? "&search=0" : "");
    });

    var username = getQueryVariable("username");
    var repository = getQueryVariable("repository");
    var showSearch = getQueryVariable("search");

    if(username != "" && repository != "") {
        $("#username").val(username);
        $("#title .username").text(username);
        $("#repository").val(repository);
        $("#title .repository").text(repository);
        validateInput();
        getUserRepos();
        $(".output").hide();
        $("#description").hide();
        $("#loader-gif").show();
        getStats();

        if(showSearch == "0") {
            $("#search").hide();
            $("#description").hide();
            $("#title").show();
        }
    } else {
        $("#username").focus();
    }
});
