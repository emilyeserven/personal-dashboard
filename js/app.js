import {test} from './panels/test.js';
import {weather} from './panels/weather.js';
import {Tasks} from './panels/tasks.js';
import {Container} from './container.js';

test();
weather();
let panelContainer = new Container("#app", 0);
let taskList = new Tasks(panelContainer);

 
// Uncomment this to check out the panel removal func.
//let taskList2 = new Tasks(panelContainer);
//taskList2.removePanel();
