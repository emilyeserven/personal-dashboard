import {Panel} from '../Panel.js';
import { CLICKUP_KEY } from '../keys.js';

// Consider making the contaimer panelList topic a class property.

class Bookmarks extends Panel {
    pocketCache = [];
    //clickUpDatebinned = [];
    pocketFormatted = [];
    //priorityBins = [];
    //dateBins = [];
    //approxTimeBins = [];
    currentLinks = [];
    //buttonsReady = false;
    pocketTagBins = [];
    bookmarksLoaded = false;
    panelType = "Bookmarks";
    constructor(container) {
        super();
        console.log("constructor");
        this.parContainer = container;
        this.parId = container.panelCount;
        this.panelNode = put(container.containerNode, "div#-list-" + this.parId + ".bookmark-list");
        this.createPanel();
    }
    setCache() {
        // The third-party API request is made here.

        console.log("setCache");
        console.log("this", this);
        var self = this;
        var xhttpPocket = new XMLHttpRequest();
        var pocketResponse;

        var params = {
            "consumer_key":"90849-5a4ef342a72a3ebcd76ec1db",
            "access_token":"4cc21e9d-4f06-ec03-b118-a8aeb0",
            "count":"20",
            //"tag":"proj:personal-dashboard",
            "detailType":"complete"
        }

        // Order here is misleading, the stuff below the onreadystatechange actually gets read out and executed first.
        xhttpPocket.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = xhttpPocket.responseText;
                var parsedResponse = JSON.parse(response);
                pocketResponse = parsedResponse.list;
                self.pocketCache = pocketResponse;
                self.formatCache();
            }
            // TODO: Build in error states.
        };

        // Dynamically build endpoint so that we start one week prior. Just in case things are.... severely overdue.
        // This value should be a class-property thing and the below should be the default if it's not defined.
        //var minDay = moment().subtract(7, 'days').format("x");

        // CORS is necessary but profoundly annoying, so I'm using this proxy for now.
        //xhttpClickUp.open("GET", "https://cors-anywhere.herokuapp.com/https://api.clickup.com/api/v2/team/1286597/task?due_date_gt="+ minDay +"&order_by=due_date&reverse=true", true);
        
        // Uncomment this if CORS gets solved or some CORS anywhere extension hack-solution is being used.
        xhttpPocket.open("POST", "https://cors-anywhere.herokuapp.com/https://getpocket.com/v3/get", true);
        //xhttpPocket.open("POST", "https://crossorigin.me/https://getpocket.com/v3/get", true);
        
        xhttpPocket.setRequestHeader("Content-Type", "application/json");
        xhttpPocket.send(JSON.stringify(params));
    }
    formatCache() {
        // This is where the data gets turned into something usable.
        console.log("formatCache");
        var self = this;
        var rawData = self.pocketCache;
        var bookmarks = [];
        console.log("rawData", rawData);
        for (var link in rawData) {
            var item = rawData[link];
            console.log("item", item);
            var id = "po-" + item.item_id;
            bookmarks[id] = {};
            bookmarks[id] = {
                id: id,
                title: item.resolved_title,
                url: item.resolved_url,
                favorite: (item.favorite == "1" ? true : false),
                description: item.excerpt,
                image: (item.has_image == "1" ? item.image.src : ""),
                //tags: [],
                date: item.time_added
            }

            if (item.tags) {
                console.log("item.tags", item.tags);
                for (var tagItem in item.tags){
                    console.log("tagItem", tagItem);
                    if (!bookmarks[id].tags) bookmarks[id].tags = [];
                    bookmarks[id].tags.push(tagItem);
                }
            }
        };

        console.log("bookmarks", bookmarks);
        self.pocketFormatted = bookmarks;
        // Next, we actually associate tasks with the bins.
        self.createBins();
    }
    createBins() {
        console.log("CreateBins");
        var self = this;

        // Make copies of the class properties so stuff doesn't change on us before we're ready. (By value vs by reference.)
        var forData = self.pocketFormatted;
        //var dBin = self.dateBins, 
        var ptBin = self.pocketTagBins;

        // Taking the opportunity to create datebins and priority bins here.
        // If an entry does not exist, it's added. Otherwise, it's left alone.

        // We're checking each task in our formatted data array. Only the item ID gets referenced.
        // When the bins are checked and used to make DOM changes, 

        //console.log("dBin", dBin);
        //console.log("atBin", atBin);
        for (var link in forData) {
            var item = forData[link];
            // First, push to 
            //console.log("item", item);
            if (item.tags) {
                for (var i = 0; i < item.tags.length; i++) {
                    var binTag = item.tags[i];
                    //console.log("binTag", binTag);
                    if (!ptBin[binTag]) ptBin[binTag] = [];
                    ptBin[binTag].push(item.id);
                }
            }
        }
        console.log("ptBin", ptBin);
        self.pocketTagBins = ptBin, self.DOMReady = true;
        //self.dateBins = dBin, self.priorityBins = pBin, self.DOMReady = true, self.approxTimeBins = atBin;
        //self.wireButtons();
        self.links();
    }
    links(day) {
        console.log("links(day)");
        var self = this;
        /*
        var setDay;

        // TODO: Add in a "catch" (and reformat) for when date is not formatted correctly.

        // A handy switch statement allows us to not have to hardcode things! .tasks("today") can be called and data will be autogenerated.
        switch (day) {
            case "today":
                setDay = moment().utcOffset('-0400').format('YYYY/MM/DD');
                break;
            case "tomorrow":
                setDay = moment().add(1, 'days').utcOffset('-0400').format('YYYY/MM/DD');
                break;
            default:
                // If a non-"words" argument is provided, this is the "case". Heh.
                // If the "day" parameter was provided, it'll use that. Otherwise...
                // If only .tasks() is called, this will kick in and default to today.
                setDay = day ? day : moment().utcOffset('-0400').format('YYYY/MM/DD');
                break;
        }
        //console.log("setDay", setDay);

        // Store the day that this panel will display.
        self.taskDay = setDay;
        */

        // We need to make sure we actually have data first! If we don't, that method will be called and eventually
        // the code will come back here once we're ready.
        if (self.DOMReady == false) {
            console.log("HEY, we don't have any data!!");
            self.setCache();
        } else {
            console.log("else");
            var linkList = self.panelNode;

            // If the task list has already been loaded, then delete old nodes.
            // Ideally this should be done in some kind of update method.
            // A self.currentLinks array exists in case, in the future, not all nodes need to be removed.
            // Probably would be done by giving a data attribute of the id or something. Dunno how sorting would work though.
            if (self.linksLoaded == true) {
                var childNodes = linkList.querySelectorAll("div.link-item");
                for (var i = 0; i < childNodes.length; i++) {
                    linkList.removeChild(childNodes[i]);
                }
            }
            var panelData = self.pocketFormatted, ptBins = self.pocketTagBins;
            console.log("panelData", panelData);
            console.log("ptBins", ptBins);
            // This is the <ul> the tasks will go into.
            
            
            // We're looping through the datebin, but actually using info from self.clickUpFormatted.
            // The key is the id!
            //console.log("dBins", dBins);
            //console.log("self.taskDay", self.taskDay);
            self.currentLinks = [];
            //dBins[self.taskDay].forEach(function(id){
            //panelData.forEach(function(id){
            for (var id in panelData) {
                console.log("id", id);
                var link = panelData[id];
                //console.log(task);
                self.currentLinks.push(id);
                // Now a list item is created.
                //var taskNameNodeContent = task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)";
                /*
                var taskNameNode = put(taskList, "li.linkNode", {
                    innerHTML: task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)"
                }); */
                //put(taskNameNode, "p", taskNameNodeContent);
                //taskNameNode.innerHTML = task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)";
                //taskList.appendChild(taskNameNode);
                var linkNode = put(linkList, "div.task-item");
                linkNode.id = "link-" + link.id;
                    var linkFavorite = put(linkNode, "div.task-priority", {
                        //innerHTML: pBins[task.priority].name
                    });
                    if (link.favorite) linkFavorite.style.backgroundColor = "yellow";
                    var linkContent = put(linkNode, "div.task-content");
                        var linkTitle = put(linkContent, "h3.task-title", {
                            innerHTML: link.title
                        });
                        var linkDescription = put(linkContent, "p.task-description", {
                            innerHTML: link.description
                        });
                        var linkTag = put(linkContent, "p.task-pocket-tag", {
                            innerHTML: "??"
                        });
            };
            self.linksLoaded = true;
            //self.checkCache();
        }
    }
    checkCache() {
        // General purpose debugging.
        console.log("Cache: ", this.clickUpCache);
        console.log("Formatted: ", this.clickUpFormatted);
        console.log("dBins: ", this.dateBins);
        console.log("pBins: ", this.priorityBins);
        console.log("atBins: ", this.approxTimeBins);
    }
}


export {Bookmarks};