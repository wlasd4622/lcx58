let schedule = require('node-schedule');
let Task1 = require('./Task1');
let Task2 = require('./Task2');
let Task3 = require('./Task3');
let task1 = new Task1();
let task2 = new Task2();
let task3 = new Task3();

// //每天2点执行
// schedule.scheduleJob('1 1 2 * * *', async function () {
//   //店铺<-->houseid
//   task2.main();
// });

// //每天3点执行
// schedule.scheduleJob('1 1 3 * * *', async function () {
//   //刷新,推送
//   task1.main();
// });

// //每天8点执行
// schedule.scheduleJob('1 1 8 * * *', async function () {
//   //精选
//   task3.main();
// });

task1.main();
