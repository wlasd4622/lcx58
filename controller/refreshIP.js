let puppeteer = require('puppeteer');
let schedule = require('node-schedule');
let fs = require('fs')
const moment = require('moment');
class RefreshIP {
    constructor() {}

    log(T) {
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


    sleep(ms = 300) {
        this.log(`>>>sleep:${ms}`)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, ms);
        })
    }


    async runPuppeteer() {
        this.log(`>>>runPuppeteer`);
        try {
            this.close()
        } catch (err) {
            this.log(err);
        }
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized', '--disable-infobars']
        });
        this.page = await this.browser.newPage();
    }

    async close() {
        this.log('>>>close');
        try {
            if (this.browser) await this.browser.close()
        } catch (error) {
            this.log(error)
        }
    }

    /**
     * 查找等待元素出现
     * @param {*} selector
     * @param {*} page
     */
    async waitElement(selector, page) {
        let len = 0;
        try {
            this.log('>>>waitElement');
            this.log(selector)
            if (!page) {
                page = this.page
            }

            let jqueryExist = false;
            do {
                this.log(`do:jqueryExist:${jqueryExist}`)
                await this.sleep()
                jqueryExist = await this.page.evaluate(() => {
                    return typeof window.jQuery === 'function'
                })
            } while (!jqueryExist)

            for (let index = 0; index < 10; index++) {
                this.log(`waitElement第${index}次寻找...`)
                await this.sleep(500)
                len = await page.evaluate(selector => {
                    return jQuery(selector).length;
                }, selector);
                this.log(`寻找结果${len}`)
                if (len) {
                    break;
                }
            }
        } catch (error) {
            console.error(error)
            this.log(error)
        }
        return len;
    }

    /**
     * 等待jquery
     */
    async waitJquery() {
        this.log(`>>>waitJquery`)
        let jqueryExist = false;
        do {
            this.log(`do:jqueryExist:${jqueryExist}`)
            await this.sleep()
            jqueryExist = await this.page.evaluate(() => {
                return typeof window.jQuery === 'function'
            })
        } while (!jqueryExist)
    }

    unique(arr) {
        return Array.from(new Set(arr))
    }

    async task1() {
        await this.page.goto('https://baidu.com')
        await this.sleep(10000)
        await this.page.evaluate(() => {
            function doConnect(n) {
                var s = "&wan=" + n;
                let url = "/userRpm/StatusRpm.htm?Connect=连 接" + s;
                console.log(url);
                return url
            }

            function doDisConnect(n) {
                var s = "&wan=" + n;
                let url = "/userRpm/StatusRpm.htm?Disconnect=断 线" + s;
                console.log(url);
                return url
            }

            function loadJquery() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '//cdn.bootcss.com/jquery/2.1.2/jquery.min.js';
                document.getElementsByTagName('head')[0].appendChild(script);
            }

            function createIframe() {
                let iframe = $('<iframe>');
                $('html').append(iframe)
                return iframe
            }

            (function() {
                loadJquery();
                setTimeout(function() {
                    window.iframe = createIframe();
                    iframe.attr('src', doDisConnect(1));
                    setTimeout(function() {
                        iframe.attr('src', doConnect(2));
                    }, 1000)
                }, 2000)
            })();
        })
    }
    async main() {
        this.log(`>>>main`);
        await this.runPuppeteer()
        await this.task1()
    }
}

new RefreshIP().main();