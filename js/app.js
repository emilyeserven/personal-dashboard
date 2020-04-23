import {test} from './panels/Test.js';
import {Weather} from './panels/Weather.js';
import {Tasks} from './panels/Tasks.js';
import {Container} from './Container.js';

test();
let panelContainer = new Container("#app", 0);
let weatherToday = new Weather(panelContainer, "today");
let weatherTomorrow = new Weather(panelContainer, "tomorrow");
let taskList = new Tasks(panelContainer);

 
// Uncomment this to check out the panel removal func.
//let taskList2 = new Tasks(panelContainer);
//taskList2.removePanel();
