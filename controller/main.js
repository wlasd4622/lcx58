let schedule = require('node-schedule');
let Ganji = require('./58ganji')
let Task0 = require('./Task0');
let Task1 = require('./Task1');
let Task2 = require('./Task2');
let Task3 = require('./Task3');
let Task4 = require('./Task4');
let Task5 = require('./Task5');
let Task6 = require('./Task6');
let ganji = new Ganji();
let task0 = new Task1();
let task1 = new Task1();
let task2 = new Task2();
let task3 = new Task3();
let task4 = new Task4();
let task5 = new Task5();
let task6 = new Task6();

//每小时执行
schedule.scheduleJob('30 1 * * * *', async function () {
  try {
    //更新userSession
    ganji.mainTask();
  } catch (err) {
    console.log(err)
  }
  try {
    //监听精选 是否超过当前设置的预算
    task4.main();
  } catch (err) {
    console.log(err)
  }
});

//每天9,13,15点执行
schedule.scheduleJob('1 1 9,13,15 * * *', async function () {
  try {
    //映射infoid<-->houseId
    await task2.main();
  } catch (err) {
    console.log(err)
  }
  try {
    //急速 推送上架
    await task6.main();
    //刷新,推送 houseInfo
    // await task1.main();
  } catch (err) {
    console.log(err)
  }
});

//每天2点执行
schedule.scheduleJob('1 1 2 * * *', async function () {
  try {
    //刷新
    await task1.main();
  } catch (err) {
    console.log(err)
  }
});

//每天9点执行
schedule.scheduleJob('1 1 9 * * *', async function () {
  try {
    //设置精选
    await task3.main();
  } catch (err) {
    console.log(err)
  }
});

//每天19点执行
schedule.scheduleJob('1 1 19 * * *', async function () {
  try {
    //下架精选houseInfo  下架除了成都账户的精选
    await task5.main(0);
  } catch (err) {
    console.log(err)
  }
});

//每天23点执行
schedule.scheduleJob('1 1 23 * * *', async function () {
  try {
    //下架精选houseInfo  下架成都账户的精选
    await task5.main(1);
  } catch (err) {
    console.log(err)
  }
});


async function main() {
  console.log('>>>main')
  try {
    //店铺<-->houseid
    //await task2.main();
    //刷新,推送
    // await task1.main();
    //精选
    //await task3.main();
    //监听精选
    // await task4.main();

    await task6.main(1);

    // await task6.main();
    // ganji.mainTask();
    // await ganji.mainTask();
    // schedule.scheduleJob('30,31,35,34 * * * * *', ()=>{
    //   console.log('scheduleCronstyle:'+ new Date());
    // })
  } catch (err) {
    console.log(err);
  }
}
// main();
