//import {Tasks} from './panels/tasks.js';

/*
    TODO list

    1. Give panels widths/row space. Maybe through flexbox.
    2. Add common panel titles.
*/


class Panel {
    propertyTest = "Hello!";
    panelNode = "";
    panelName = "";
    parId = "";
    parContainer = "";
    DOMReady = false;
    createPanel() {
        var self = this;
        console.log("createPanel");
        console.log("this", this);
        var containerTopic = self.parContainer.containerTopicName;

        // Object to be sent to the Container.
        var topicData = {
            "isPanelAdd": true, //prep for when these are removable
            "type": self.panelType,
            "node": self.panelNode,
            "parId": self.parId
        };

        pubsub.publish(containerTopic, [topicData]);
        
        this.setCache();
    }
    removePanel() {
        // This removes the panel from the DOM but also from the container's panelList.
        console.log("removePanel");
        console.log("this", this);
        var self = this;
        var containerTopic = self.parContainer.containerTopicName;

        // Remove the DOM element and all its children. BOOM!
        self.parContainer.containerNode.removeChild(self.panelNode);

        // Object to be sent to the Container. Because this is a removal, all we need to send is that flag (isPanelAdd: false)
        // and the panelName that we can remove from the main list.
        var topicData = {
            "isPanelAdd": false, //prep for when these are removable
            "panelName": self.panelType + "-" + self.parId
        };
        pubsub.publish(containerTopic, [topicData]);
    };
}

export {Panel};