function test() {
     // For the "Testing"
     console.log("testing!");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        var response = xhttp.responseText;
        //console.log(response);
        var parsedResponse = JSON.parse(response);
        //console.log(parsedResponse);
        var answer = parsedResponse.name;
        //console.log(answer);
        document.getElementById("test").innerHTML = answer;
        }
    };
    xhttp.open("GET", "https://pokeapi.co/api/v2/pokemon/ditto/", true);
    xhttp.send();
}

export {test};