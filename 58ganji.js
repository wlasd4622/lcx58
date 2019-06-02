let puppeteer = require('puppeteer');
let fs = require('fs');
class GanJi {
    constructor() {
        this.page = null;
        this.browser = null;
    }
    async runPuppeteer() {
        this.browser = await (puppeteer.launch({
            headless: false
        }));
        this.page = await this.browser.newPage();
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

    async main() {
        await this.runPuppeteer();
        let url = `http://vip.58ganji.com/user/brokerhomeV2`
        await this.page.goto(url, {
            waitUntil: 'domcontentloaded'
        });

    }
}

new GanJi().main();


http: //vip.58ganji.com/ajax/home/account/?time=1559470358000&_=1559470358106
    Accept: application / json, text / javascript, *
    /*; q=0.01
    Accept-Encoding: gzip, deflate
    Accept-Language: zh-CN,zh;q=0.9
    Connection: keep-alive
    Cookie: aQQ_brokerguid=83E7FB92-419C-374C-6E9F-5F9E480901AF; wmda_uuid=f0d6c8d1697cb8ddc7671eca51f72fd2; wmda_new_uuid=1; wmda_visited_projects=%3B8920741036080; 58tj_uuid=33096b59-53c5-4de1-a374-a10570ba4c11; sessid=3ABD3EC3-2AA0-E180-96E3-1945A3E226EB; new_uv=2; ajk_broker_id=5729370; ajk_broker_ctid=22; ajk_broker_uid=42982955; wmda_session_id_8920741036080=1559469360132-87b05731-a7c5-fb1a; aQQ_brokerauthinfos=P4PcJ3ZmbtOD%2BTY8%2BC4A8DN2YMPq7n%2F3138VLYi4LlrAzd2zVblFIF1wEx3g2WUP%2BH%2B%2FFEZQ69ucylXIu%2F%2Bf8uZGe5c%2FUJFJgLPaTRBg4I%2Frk9iXUWz5zZtSRO4%2BbJLsYu%2BDrrzXAQ74jIEz48QPWWQz27JxFxoM7jsySrtLHisPQ%2FjONKKVwZ5uQc0gTjCzvbdTRok
    Host: vip.58ganji.com
    Referer: http://vip.58ganji.com/user/brokerhomeV2
    User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36
    X-Requested-With: XMLHttpRequest
    time: 1559470358000
    _: 1559470358106