//import {Tasks} from './panels/tasks.js';

/*
    TODO list

    1. Give panels widths/row space. Maybe through flexbox.
    2. Add common panel titles.
*/


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
        this.containerNode = put(this.containerParentNode, "div#container-" + this.containerId + ".container");

        // TODO: This isInit seemed to be needed to prevent it from calling the topic sub twice??
        //       I think I fixed it but I'm leaving this here for now.
        if (this.isInit == false) {
            this.beginListen();
        }
        this.isInit = true;
    }
    beginListen() {
        // I guess I'm setting topics here?
        var self = this;

        // So... the panelList is basically a manifest of all the cards in this container.
        // Cards within the same container should be able to interact and connect with each other.
        // The panelList is supposed to help facilitate that, and specific references are necessary for cards to explicitly reach out to each other.
        // For now I'm using a topic to facilitate this. Perhaps a regular 'ol method may be better though?
        // It's being set as a class property so that its name is synced around panels that will be in the panelList.
        this.containerTopic = pubsub.subscribe(self.containerTopicName, function(data){
            self.panelListUpdate(data);
        });
    }
    panelListUpdate(data) {
        var self = this;
        console.log("panelListUpdate");
        console.log("data", data);

        // Note that DOM manipulation is done in the actual panel. Considering bringing that here as a guarantee everything happens in the same place.
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
    }
}

export {Container};