let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
class GanJi {
  constructor() {
    this.AccountList = [
      'HUOKE_STATUS=1; sessid=467DAFD5-543C-8CCA-588D-52CBF0DDF8B9; aQQ_brokerguid=6A683DB2-0096-5738-9CDA-D98DA6E5C686; wmda_uuid=99721d90b855844a9716fc888d8ba59e; wmda_new_uuid=1; wmda_visited_projects=%3B8920741036080; anjukereg=7orZe6nCH0WtY0Zj; wmda_session_id_8920741036080=1559629144565-4c4459a1-21b9-7b97; 58tj_uuid=827f6bf8-ab82-4d37-8de7-f471b518fb24; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=6850935; ajk_broker_ctid=14; ajk_broker_uid=44150906; aQQ_brokerauthinfos=P9OIdXo0bt%2BA9jE18ioF8DJwYM%2Fu7332238SK4m%2BLlrAztK0XLNBJV10SE23hW0P%2FnK5RxYGuIucx1fCuvGYprYZe5c%2BB8JN27PaTRBg44nrk9rib2zpqJVSQuE1XZfQY9GyrYDrCQ3%2FjIQz4P4xYQ8P4LV1EUBX4mxmSrpNTHsNGaDMYfaSnsppEsggETPl0LA'
    ]
    this.page = null;
    this.browser = null;
  }
  async runPuppeteer() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized', '--disable-infobars']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1500,
      height: 800
    })
  }

  sleep(ms = 300) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, ms);
    })
  }
  async close() {
    if (this.browser) await this.browser.close()
  }

  async setCookie(cookies_str = "", domain, page) {
    let cookies = cookies_str.split(';').map(pair => {
      let name = pair.trim().slice(0, pair.trim().indexOf('='))
      let value = pair.trim().slice(pair.trim().indexOf('=') + 1)
      return {
        name,
        value,
        domain
      }
    });
    cookies.push({
      name: 'aaa',
      value: '111',
      domain
    })
    return Promise.all(cookies.map(pair => {
      return page.setCookie(pair)
    }));
  }
  async task1() {
    try {
      await this.runPuppeteer();
      let url = `http://vip.58ganji.com/user/brokerhomeV2`
      await this.setCookie(this.AccountList[0], '.58ganji.com', this.page);
      await this.setCookie(this.AccountList[0], '.58.com', this.page);
      await this.setCookie(this.AccountList[0], '.vip.58.com', this.page);
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded'
      });
      await this.page.waitForSelector('.account-mod')
      //房产推广币
      let blanceHbg58 = await this.page.evaluate(() => {
        return $('.account-mod li:eq(1) b').text();
      });
      //服务中及预约中的套餐开通及到期时间
      await this.myService();
      //推送中，在线购买，还可推送，今日推送到期数量
      await this.yxtgsp58();
      // 房产推广币，日期选到两年以后，查询最近3笔的余额到期时间及剩余金额
      await this.myperiod();
      await this.close()
    } catch (err) {
      console.error(err)
    }
  }
  async main() {
    // 每分钟的第30秒触发： '30 * * * * *'
    // 每小时的1分30秒触发 ：'30 1 * * * *'
    // 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
    // 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
    // 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
    // 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
    schedule.scheduleJob('30 1 * * * *', function () {
      console.log('scheduleCronstyle:' + new Date());
      this.task1();
    });
  }
  //服务中及预约中的套餐开通及到期时间
  async myService() {
    let url = "http://vip.58ganji.com/thirdredirect/?logintype=wuba&dialog=1/&redirecturl=http://vip.58.com/app/fuwu#/app/wltdingdan/"
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#ContainerFrame')
    url = await this.page.$eval('#ContainerFrame', ele => ele.src)
    console.log(url);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('table')

    let serviceArr = await this.page.evaluate(() => {
      function filter() {
        let serviceArr = []
        $('table tr').toArray().map((item, index) => {
          let days = parseInt($(item).find('td:eq(7)').text());
          if (days) {
            //服务状态
            let status = $(item).find('td::eq(4)').text()
            //开通日期
            let start = $(item).find('td::eq(5)').text()
            //到期日期
            let end = $(item).find('td::eq(6)').text()
            serviceArr.push({
              status,
              start,
              end,
              days
            })
          }
        })
        return serviceArr;
      }
      return filter()
    })
    console.log(JSON.stringify(serviceArr))
    return serviceArr
  }
  //推送中，在线购买，还可推送，今日推送到期数量
  async yxtgsp58() {
    let url = `http://vip.58ganji.com/jp58/yxtgsp58`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('.layout-right')
    let result = await this.page.evaluate(() => {
      function foamat() {
        var data = {}
        $('dt:contains(优先推送)').next().find('>span').toArray().map(item => {
          let info = $(item).text().split('：');
          data[info[0]] = parseInt(info[1])
        })
        let 在线购买 = $('dt:contains(优先推送)').next().find('span:contains(在线购买)').length && $('dt:contains(优先推送)').next().find('span:contains(在线购买)').text().match(/在线购买(\d+)/)[1]
        if (在线购买) {
          在线购买 = parseInt(在线购买)
          data['在线购买'] = 在线购买;
        }
        return data;
      }
      return foamat()
    })
    console.log(JSON.stringify(result))
    return result;
  }

  // 房产推广币，日期选到两年以后，查询最近3笔的余额到期时间及剩余金额
  async myperiod() {
    let url = `https://my.58.com/pro/tuiguangbi/myperiod/`
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#ContainerFrame')
    url = await this.page.$eval('#ContainerFrame', ele => ele.src)
    console.log(url);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded'
    })
    await this.page.waitForSelector('#details-ul')
    await this.page.click('#accountkind7')
    await this.page.waitForSelector('#createTimeTos')
    await this.page.evaluate(() => {
      $('#createTimeTos').val('2050-09-04')
    })
    await this.page.click('#btnSubmit')
    await this.sleep(2000)
    let data = await this.page.evaluate(() => {
      function format() {
        return $('table tr:gt(0):lt(3)').toArray().map(item => {
          return {
            '推广币': $(item).find('td:eq(2)').text().trim(),
            '到期时间': $(item).find('td:eq(4)').text().trim(),
            '剩余可用数量': $(item).find('td:eq(5)').text().trim(),
          }
        })
      }
      return format()
    })
    console.log(JSON.stringify(data))
    return data;
  }

}
new GanJi().main();
