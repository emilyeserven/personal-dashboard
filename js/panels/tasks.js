import {Panel} from '../Panel.js';
import { CLICKUP_KEY } from '../keys.js';

// DONE (4/21): Figure out how to have multiple instances of Tasks panel.
// TODO: Add buttons dynamically with put, add in a create and remove panel button.
// TODO: Add in rows and other (better) layout functionality.
// TODO: Add ability to initialize this panel with various endpoint parameters so multiple instances actually make sense.
// TODO: Clean up var declarations. Look into the merits of let?
// TODO: Differentiate all the constants and data we get from the container!!
// TODO: Look into some sort of Panel class that this can extend. For things like createPanel() and removePanel().
      
// TODO: When data refreshing is a thing, this (createBins) should be updated to check if items should be moved around or not.
/* 
*  Something like...
*  1. Check if ID is in same place as before. 
*  2. If not, check other bins. If it's found, delete from old bin. (Also, add an item to a "Revised" array/object to keep track of changes.)
*  3. If not found in others, delete it.
*  
*  No clue if simply resetting the entire bin is easier. Just jotting down just in case. May or may not cause more DOM rewrites. Dunno yet.
*/


// Consider making the contaimer panelList topic a class property.

class Tasks extends Panel {
    clickUpCache = [];
    //clickUpDatebinned = [];
    clickUpFormatted = [];
    priorityBins = [];
    dateBins = [];
    approxTimeBins = [];
    currentTasks = [];
    buttonsReady = false;
    tasksLoaded = false;
    panelType = "Tasks";
    constructor(container) {
        super();
        console.log("constructor");
        this.parContainer = container;
        this.parId = container.panelCount;
        this.panelNode = put(container.containerNode, "div#task-list-" + this.parId + ".task-list");
        this.createPanel();
    }
    setCache() {
        // The third-party API request is made here.

        console.log("setCache");
        console.log("this", this);
        var self = this;
        var xhttpClickUp = new XMLHttpRequest();
        var clickUpResponse;

        // Order here is misleading, the stuff below the onreadystatechange actually gets read out and executed first.
        xhttpClickUp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = xhttpClickUp.responseText;
                var parsedResponse = JSON.parse(response);
                clickUpResponse = parsedResponse["tasks"];
                self.clickUpCache = clickUpResponse;
                self.formatCache();
            }
            // TODO: Build in error states.
        };

        // Dynamically build endpoint so that we start one week prior. Just in case things are.... severely overdue.
        // This value should be a class-property thing and the below should be the default if it's not defined.
        var minDay = moment().subtract(7, 'days').format("x");

        // CORS is necessary but profoundly annoying, so I'm using this proxy for now.
        xhttpClickUp.open("GET", "https://cors-anywhere.herokuapp.com/https://api.clickup.com/api/v2/team/1286597/task?due_date_gt="+ minDay +"&order_by=due_date&reverse=true", true);
        
        // Uncomment this if CORS gets solved or some CORS anywhere extension hack-solution is being used.
        //xhttpClickUp.open("GET", "https://api.clickup.com/api/v2/team/1286597/task?due_date_gt="+ minDay +"&order_by=due_date&reverse=true", true);
        
        // Key is in another castle, uh I mean file. In case git repo goes public.
        xhttpClickUp.setRequestHeader("authorization", CLICKUP_KEY);
        xhttpClickUp.send();
    }
    formatCache() {
        // This is where the data gets turned into something usable.
        console.log("formatCache");
        var self = this;
        var rawData = self.clickUpCache;
        var i, taskDates = [];
        
        var taskmap = [], priorityBin = {}, atBins = {};

        // Create the default "no priority" bin.
        priorityBin["5"] = {
            name: "none",
            color: "#EEEEEE",
            tasks: [],
            id: "" + 5
        };

        // ... and the default "Approx Time" bin.
        atBins["0"] = {
            name: "none",
            color: "#333",
            tasks: [],
            order: 0
        };

        var customFields = rawData[0].custom_fields;
        customFields.forEach(function(field){
            //console.log("field", field);
            if (field.name == "Approx Time") {
                //console.log("Yes!");
                var opts = field.type_config.options;
                for (var opt in opts) {
                    var item = opts[opt];
                    if(!atBins[item.orderindex + 1]) atBins[item.orderindex + 1] = {
                        name: item.name,
                        color: item.color,
                        order: item.orderindex + 1,
                        tasks: []
                    }
                }
            }
        });

        for (i = 0; i < rawData.length; i++) {
            var item = rawData[i];
            var taskDate = item.readableDate;
            // Adding an object because otherwise it's hard to loop through and add the custom field
            taskmap[item.id] = {};
            //console.log(item.priority);
            taskmap[item.id] = {
                id: item.id,
                name: item.name,
                description: item.description,
                status: item.status.status,
                dueDateRaw: item.due_date,
                dueDate: (item.due_date ? moment(item.due_date, "x").format("YYYY/MM/DD") : ""),
                startDate: (item.start_date ? moment(item.start_date, "x").format("YYYY/MM/DD") : ""),
                startDateRaw: item.start_date,
                tiddler: "",
                link: "",
                time: 0,
                pocket: "",
                alfred: "",
                tags: [],
                // Priority comes back null from API if not set. Set it to 5 here. (In API: Urgent is "1", Low is "4")
                priority: (item.priority ? item.priority.id : "5"),
                list: item.list.name,
                listId: item.list.id,
                folder: item.folder.name,
                folderId: item.folder.id,
                spaceId: item.space.id
            };

            var currentObj = taskmap[item.id];

            if (item.priority){
                //console.log(item.priority);
                // Priorities are assigned extra info from the API to keep consistent formatting.
                priorityBin[item.priority.id] = {
                    name: item.priority.priority,
                    color: item.priority.color,
                    tasks: [],
                    id: item.priority.id
                };
            }

            // Custom fields are weird, so we need to loop through each one to get the value.
            item.custom_fields.forEach(function(field){
                if (field.value) {
                    //console.log("value exists");
                    switch (field.name) {
                        case "Tiddler":
                            currentObj.tiddler = field.value;
                            break;
                        case "Relevant Link":
                            currentObj.link = field.value;
                            break;
                        case "Alfred Query":
                            currentObj.alfred = field.value;
                            break;
                        case "Approx Time":
                            currentObj.time = field.value + 1;
                            break;
                        case "Pocket Tag":
                            currentObj.pocket = field.value;
                            break;
                        default:
                            break;
                    }
                }
            });

            // Push tags to an array. Has to be done this way because the API is super verbose.
            item.tags.forEach(function(tag){
                currentObj.tags.push(tag.name);
            });
        }
        //console.log("dateBin", dateBin);

        // Officially set the bins and formatted data.
        self.priorityBins = priorityBin;
        //self.dateBins = dateBin;
        self.approxTimeBins = atBins;
        self.clickUpFormatted = taskmap;
        //self.checkCache();

        // Next, we actually associate tasks with the bins.
        self.createBins();
    }
    createBins() {
        console.log("CreateBins");
        var self = this;

        // Make copies of the class properties so stuff doesn't change on us before we're ready. (By value vs by reference.)
        var forData = self.clickUpFormatted;
        //var dBin = self.dateBins, 
        var pBin = self.priorityBins;
        var atBin = self.approxTimeBins;
        var dBin = [];//, pBin = {};

        // Taking the opportunity to create datebins and priority bins here.
        // If an entry does not exist, it's added. Otherwise, it's left alone.

        // We're checking each task in our formatted data array. Only the item ID gets referenced.
        // When the bins are checked and used to make DOM changes, 

        //console.log("dBin", dBin);
        //console.log("atBin", atBin);
        for (var task in forData) {
            var item = forData[task];
            // First, push to 
            //console.log("item", item);
            if (!dBin[item.dueDate]) dBin[item.dueDate] = [];
            dBin[item.dueDate].push(item.id);
            atBin[item.time].tasks.push(item.id);
            pBin[item.priority].tasks.push(item.id);
        }
        self.dateBins = dBin, self.priorityBins = pBin, self.DOMReady = true, self.approxTimeBins = atBin;
        self.wireButtons();
    }
    wireButtons() {
        console.log("wireButtons");
        // This probably shouldn't be here.
        // Probably need to make a new file that references this one and some kind of update method.
        // Probably should make these out of constructors or something. 
        // See here? https://github.com/emilyeserven/testwebsites/commit/ee4544b00350dbeee2559172f3c69b76814aec69#diff-58284e442f8345709490e8f13433c275
        var self = this;
        var buttonToday = document.querySelector("#buttonToday");
        var buttonTomorrow = document.querySelector("#buttonTomorrow");

        buttonToday.addEventListener("click", function() {
            self.tasks("today")
        }, false);

        buttonTomorrow.addEventListener("click", function() {
            self.tasks("tomorrow")
        }, false);
        //console.log("buttonTomorrow");
        self.ButtonsReady = true;
        self.tasks(self.taskDay);
    }
    tasks(day) {
        console.log("tasks(day)");
        var self = this;
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

        // We need to make sure we actually have data first! If we don't, that method will be called and eventually
        // the code will come back here once we're ready.
        if (self.DOMReady == false) {
            console.log("HEY, we don't have any data!!");
            self.setCache();
        } else {
            var taskList = self.panelNode;

            // If the task list has already been loaded, then delete old nodes.
            // Ideally this should be done in some kind of update method.
            // A self.currentTasks array exists in case, in the future, not all nodes need to be removed.
            // Probably would be done by giving a data attribute of the id or something. Dunno how sorting would work though.
            if (self.tasksLoaded == true) {
                var childNodes = taskList.querySelectorAll("div.task-item");
                for (var i = 0; i < childNodes.length; i++) {
                    taskList.removeChild(childNodes[i]);
                }
            }
            var panelData = self.clickUpFormatted, dBins = self.dateBins, pBins = self.priorityBins, atBins = self.approxTimeBins;

            // This is the <ul> the tasks will go into.
            
            
            // We're looping through the datebin, but actually using info from self.clickUpFormatted.
            // The key is the id!
            //console.log("dBins", dBins);
            //console.log("self.taskDay", self.taskDay);
            self.currentTasks = [];
            dBins[self.taskDay].forEach(function(id){
                var task = panelData[id];
                //console.log(task);
                self.currentTasks.push(id);
                // Now a list item is created.
                //var taskNameNodeContent = task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)";
                /*
                var taskNameNode = put(taskList, "li.taskNode", {
                    innerHTML: task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)"
                }); */
                //put(taskNameNode, "p", taskNameNodeContent);
                //taskNameNode.innerHTML = task.name + " || (<a href='https://app.clickup.com/t/" + id + "' target='_blank'>more</a>)";
                //taskList.appendChild(taskNameNode);
                var taskNode = put(taskList, "div.task-item");
                taskNode.id = "task-" + task.id;
                    var taskPriority = put(taskNode, "div.task-priority", {
                        //innerHTML: pBins[task.priority].name
                    });
                    taskPriority.style.backgroundColor = pBins[task.priority].color;
                    var taskContent = put(taskNode, "div.task-content");
                        var taskTitle = put(taskContent, "h3.task-title", {
                            innerHTML: task.name
                        });
                        var taskDescription = put(taskContent, "p.task-description", {
                            innerHTML: task.description
                        });
                        var taskLocation = put(taskContent, "p.task-location", {
                            innerHTML: task.folder + " > " + task.list
                        });
                        var taskTags = put(taskContent, "p.task-tags", {
                            innerHTML: "??"
                        });
                        var taskPocketTag = put(taskContent, "p.task-pocket-tag", {
                            innerHTML: "<a href='https://app.getpocket.com/tags/" + task.pocket + "/all' target='_blank'>" + task.pocket + "</a>"
                        });
                    var taskDue = put(taskNode, "div.task-due", {
                        innerHTML: moment(task.dueDate, "YYYY/MM/DD").format("MM/DD")
                    });
                    var taskApproxTime = put(taskNode, "div.task-approx-time", {
                        innerHTML: task.time
                    });
                    taskApproxTime.style.backgroundColor = atBins[task.time].color;
            });
            self.tasksLoaded = true;
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


export {Tasks};