import { WEATHER_KEY } from '../keys.js';

function weather() {
    // For Today's temperature
    var xhttpTemp = new XMLHttpRequest();
    xhttpTemp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        var response = xhttpTemp.responseText;
        //console.log(response);
        var parsedResponse = JSON.parse(response);
        //console.log(parsedResponse);
        var tempAnswer = parsedResponse.main.temp;
        var condMainAnswer = parsedResponse.weather[0].main;
        var condSubAnswer = parsedResponse.weather[0].description;
        document.querySelector("#temp").innerHTML = tempAnswer;
        document.querySelector("#condMain").innerHTML = condMainAnswer;
        document.querySelector("#condSub").innerHTML = condSubAnswer;
        }
    };
    xhttpTemp.open("GET", "https://api.openweathermap.org/data/2.5/weather?id=4843564&units=imperial&appid=" + WEATHER_KEY, true);
    xhttpTemp.send();
    
    // For Tomorrow's Temperature
    var xhttpTempTomorrow = new XMLHttpRequest();
    xhttpTempTomorrow.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        var response = xhttpTempTomorrow.responseText;
        //console.log(response);
        var parsedResponse = JSON.parse(response);
        //console.log(parsedResponse);
        var tempAnswer = parsedResponse.list[5].main.temp;
        var condMainAnswer = parsedResponse.list[5].weather[0].main;
        var condSubAnswer = parsedResponse.list[5].weather[0].description;
        document.querySelector("#tempTomorrow").innerHTML = tempAnswer;
        document.querySelector("#condMainTomorrow").innerHTML = condMainAnswer;
        document.querySelector("#condSubTomorrow").innerHTML = condSubAnswer;
        }
    };
    xhttpTempTomorrow.open("GET", "https://api.openweathermap.org/data/2.5/forecast?id=4843564&units=imperial&appid=" + WEATHER_KEY, true);
    xhttpTempTomorrow.send();

    // Display everything
    document.querySelector("#time").innerHTML = moment().utcOffset('-0400').format('MMMM Do YYYY, h:mm:ss a');
    document.querySelector("#hour").innerHTML = moment().utcOffset('-0400').format('HH:mm');
    document.querySelector("#mon-day").innerHTML = moment().utcOffset('-0400').format('MMM D');
}

export {weather};