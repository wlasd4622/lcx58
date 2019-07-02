let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
let fs = require('fs')
const moment = require('moment');

function getConnection(name) {
  let that = this;
  log(`>>>getConnection`);
  return new Promise((resolve, reject) => {
    db[name].pool.getConnection(function (err, connection) {
      if (err) {
        that.log(err);
        reject(err)
      } else {
        resolve(connection)
      }
    });
  })
}

function log(T) {
  let info = ''
  try {
    if (T instanceof Error) {
      console.error(T)
      info = T.message
      debugger;
    } else {
      info = JSON.stringify(T).replace(/^\"+/, '').replace(/\"+$/, '')
    }
    info = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + info
    console.log(info);
    if (info.length > 200) {
      info = info.substr(0, 200) + '...'
    }
    fs.appendFileSync(`./logs/${moment().format('YYYY-MM-DD')}.log`, info + '\n')

  } catch (error) {
    console.error(error);
  }
}

function sleep(ms = 300) {
  log(`>>>sleep:${ms}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms);
  })
}

async function runPuppeteer(options = {}) {
  log(`>>>runPuppeteer`);
  try {
    closePuppeteer.call(this)
  } catch (err) {
    log(err);
  }
  this.browser = await puppeteer.launch(Object.assign({}, {
    headless: false,
    args: ['--start-maximized', '--disable-infobars']
  }, options));
  this.page = await this.browser.newPage();
}

async function goto(url, selector, page = this.page) {
  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  })
  if (selector) {
    await waitForSelector(selector)
  }
}

async function closePuppeteer() {
  log('>>>closePuppeteer');
  try {
    if (this.browser) await this.browser.close()
  } catch (error) {
    log(error)
  }
}


/**
 * 查找等待元素出现
 * @param {*} selector
 * @param {*} page
 */
async function waitElement(selector, page) {
  let len = 0;
  try {
    log('>>>waitElement');
    log(selector)
    if (!page) {
      page = page
    }

    let jqueryExist = false;
    do {
      log(`do:jqueryExist:${jqueryExist}`)
      await sleep()
      jqueryExist = await page.evaluate(() => {
        return typeof window.jQuery === 'function'
      })
    } while (!jqueryExist)

    for (let index = 0; index < 10; index++) {
      log(`waitElement第${index}次寻找...`)
      await sleep(500)
      len = await page.evaluate(selector => {
        return jQuery(selector).length;
      }, selector);
      log(`寻找结果${len}`)
      if (len) {
        break;
      }
    }
  } catch (error) {
    console.error(error)
    log(error)
  }
  return len;
}


/**
 * 等待jquery
 */
async function waitJquery() {
  log(`>>>waitJquery`)
  let jqueryExist = false;
  do {
    log(`do:jqueryExist:${jqueryExist}`)
    await sleep()
    jqueryExist = await page.evaluate(() => {
      return typeof window.jQuery === 'function'
    })
  } while (!jqueryExist)
}

function unique(arr) {
  return Array.from(new Set(arr))
}

module.exports = {
  getConnection,
  log,
  sleep,
  runPuppeteer,
  closePuppeteer,
  waitElement,
  waitJquery,
  unique,
  goto
}
