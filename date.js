module.exports.getDate = getDate; //exporting function

function getDate() {
    let today = new Date();
    let day = "";

    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    day = today.toLocaleDateString("en-US", options);

    return day;
}


module.exports.getDay = getDay // exporting function

function getDay(){
    let today = new Date();
    let day = "";

    let options = {
        weekday: "long",
    }

    day = today.toLocaleDateString("en-US", options);

    return day;
}