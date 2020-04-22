import {test} from './panels/test.js';
import {weather} from './panels/weather.js';
import {Tasks} from './panels/tasks.js';
import {Container} from './container.js';

test();
weather();
let panelContainer = new Container("#app", 0);
panelContainer.init();
let taskList = new Tasks(panelContainer);
let taskList2 = new Tasks(panelContainer);
taskList2.removePanel();