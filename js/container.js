//import {Tasks} from './panels/tasks.js';

class Container {
    panelList = [];
    get panelCount(){
        console.log("get panelCount");
        var id = 0;
        console.log(this.panelList);
        /*this.panelList.forEach( function(panel){
            console.log("forEach");
            id++;
        });
        */
        for (var panel in this.panelList) id++;
        console.log("id", id);
        return id;
    };
    containerParentNode;
    containerNode;
    containerId = 0;
    containerTopicName = "containerPanels-" + this.containerId;
    containerTopic;
    isInit = false;
    constructor(node,id) {
        console.log("constructor");
        this.containerParentNode = document.querySelector(node);
        this.containerId = id;
        this.init();
    }
    init() {
        console.log("init");
        var self = this;
        this.containerNode = put(this.containerParentNode, "div#container-" + this.containerId);

        // TODO: This isInit seemed to be needed to prevent it from calling the topic sub twice??
        if (this.isInit == false) {
            this.beginListen();
        }
        this.isInit = true;
    }
    beginListen() {
        var self = this;
        this.containerTopic = pubsub.subscribe(self.containerTopicName, function(data){
            self.panelListUpdate(data);
            //return message;
        });
    }
    panelListUpdate(data) {
        var self = this;
        console.log("panelListUpdate");
        console.log("data", data);
        if (data.isPanelAdd == true) {
            var currPanelCount = this.panelCount;
            var panelString = data.type + "-" + currPanelCount;
            this.panelList[panelString] = {
                "type": data.type + "",
                "node": data.node,
                "parId": data.parId
                //"id": currPanelCo + + "!!!"nt
            };
        } else {
            console.log("self.panelList", self.panelList);
            console.log("BEGONE, " + data.panelName + "!!!");
            delete self.panelList[data.panelName];
            console.log("self.panelList", self.panelList);
            //self.panelList[panelString];
        }
        //this.panelCount = this.panelCount + 1;
        //console.log("this", this);
        console.log("this.panelCount", this.panelCount);
        //setter(currPanelCount);
    }
}

export {Container};