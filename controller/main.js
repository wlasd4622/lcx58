let schedule = require('node-schedule');
let fs = require('fs')
let Task1 = require('./Task1');
let Task2 = require('./Task2');
let Task3 = require('./Task3');
let task1 = new Task1();
let task2 = new Task2();
let task3 = new Task3();

//每天2点执行
schedule.scheduleJob('1 1 2 * * *', async function () {
  try {
    //店铺<-->houseid
    await task2.main();
    //刷新,推送
    fs.unlinkSync('./catch/task1.json');
    await task1.main();
  } catch (err) {
    console.log(err);
  }
});

// //每天8点执行
// schedule.scheduleJob('1 1 8 * * *', async function () {
//   //精选
//   task3.main();
// });

//shopID<-->houseid
// task2.main();


//刷新,推送
// task1.main();

(async function () {
  try {
    //店铺<-->houseid
    // await task2.main();
    //刷新,推送
    // fs.unlinkSync('./catch/task1.json');
    // await task1.main();

    await task2.main();
  } catch (err) {
    console.log(err);
  }
})();
