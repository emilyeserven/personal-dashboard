import {Panel} from '../Panel.js';
import { WEATHER_KEY } from '../keys.js';

class Weather extends Panel {
    panelNode;
    parId;
    parContainer;
    panelType = "Weather";
    weatherDay = "today";
    weatherData;
    formattedData;
    constructor(container, day) {
        super();
        console.log("constructor");
        this.parContainer = container;
        this.weatherDay = day;
        this.parId = container.panelCount;
        this.panelNode = put(container.containerNode, "div#weather-" + this.parId + ".weather");
        this.createPanel();
    }
    setCache() {
        var self = this;
        var xhttpTemp = new XMLHttpRequest();
        xhttpTemp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            var response = xhttpTemp.responseText;
            //console.log(response);
            var parsedResponse = JSON.parse(response);
            self.weatherData = parsedResponse;
            self.formatCache();
            }
        };
        switch(this.weatherDay){
            case ("today"):
                xhttpTemp.open("GET", "https://api.openweathermap.org/data/2.5/weather?id=4843564&units=imperial&appid=" + WEATHER_KEY, true);
                break;
            case ("tomorrow"):
                xhttpTemp.open("GET", "https://api.openweathermap.org/data/2.5/forecast?id=4843564&units=imperial&appid=" + WEATHER_KEY, true);
                break;
        }
        xhttpTemp.send();
    }
    formatCache() {
        var self = this;
        var wData = self.weatherData;
        var wObj = {
            "temp": 0,
            "forecast": "",
            "forecastSub": ""
        }

        switch(this.weatherDay){
            case ("today"):
                wObj.temp = wData.main.temp;
                wObj.forecast = wData.weather[0].main;
                wObj.forecastSub = wData.weather[0].description;
                break;
            case ("tomorrow"):
                wObj.temp = wData.list[5].main.temp;
                wObj.forecast = wData.list[5].weather[0].main;
                wObj.forecastSub = wData.list[5].weather[0].description;
                break;
        }
        self.formattedData = wObj;
        self.placeContent();
    }
    placeContent() {
        var self = this;
        var data = self.formattedData;
        var node = self.panelNode;

        var titleNode = put(node, "h2", {
            innerHTML: self.weatherDay
        });

        var tempNode = put(node, "p", {
            innerHTML: data.temp + "<sup>o</sup>F"
        });
        var forecastNode = put(node, "p");
            var forecastNodeContent = put(forecastNode, "span", {
                innerHTML: data.forecast + ", " + data.forecastSub
            });
    }
    holding() {
        // For Today's temperature
        
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
        xhttpTempTomorrow.send();

        // Display everything
        document.querySelector("#time").innerHTML = moment().utcOffset('-0400').format('MMMM Do YYYY, h:mm:ss a');
        document.querySelector("#hour").innerHTML = moment().utcOffset('-0400').format('HH:mm');
        document.querySelector("#mon-day").innerHTML = moment().utcOffset('-0400').format('MMM D');
    }
}

export {Weather};