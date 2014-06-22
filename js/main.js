$(function() {
    validateInput();
    $("#username, #repository").keyup(validateInput);
});

function validateInput() {
    if ($("#username").val().length > 0 && $("#repository").val().length > 0) {
        $("#get-stats-button").prop("disabled", false);
    }
    else {
        $("#get-stats-button").prop("disabled", true);
    }
}