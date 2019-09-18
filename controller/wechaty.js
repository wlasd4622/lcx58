let Util = require("../common/util");
let wx = require("../common/wx");

/**
 * 刷新,推送 houseInfo
 */
class Wechaty extends Util {
  constructor() {
    super();
    this.taskName = "wechaty";
  }

  async getData() {
    let sql = `SELECT store_info_title,telephone from store_for_rents where city_id=257 ORDER BY created_at DESC LIMIT 31,30`;
    // let result = await this.execSql(2, sql);
    let result = [{
        store_info_title: "超市百货 蔬菜水产肉类熟食店 其他 房山 50㎡-100㎡",
        telephone: "17812147879"
      },
      {
        store_info_title: "餐饮美食 餐馆 其他 昌平 50㎡-100㎡",
        telephone: "18619392093"
      },
      {
        store_info_title: "超市百货 超市 其他 房山 100㎡-200㎡",
        telephone: "13522199211"
      },
      {
        store_info_title: "美容美发 美发店 其他 大兴 50㎡-100㎡",
        telephone: "18911235992"
      },
      {
        store_info_title: "餐饮美食 餐馆 奥运村 朝阳 100㎡-200㎡",
        telephone: "13436642810"
      },
      {
        store_info_title: "休闲娱乐 健身房 长阳 房山 500㎡以上",
        telephone: "17710187962"
      },
      {
        store_info_title: "美容美发 美发店 其他 大兴 50㎡-100㎡",
        telephone: "13311505171"
      },
      {
        store_info_title: "美容美发 美容院 其他 海淀 50㎡-100㎡",
        telephone: "13120022852"
      },
      {
        store_info_title: "美容美发 美容院 其他 丰台 50㎡-100㎡",
        telephone: "15001293193"
      },
      {
        store_info_title: "求租300--500²",
        telephone: "18515183615"
      },
      {
        store_info_title: "餐饮美食 餐馆 奥运村 朝阳 50㎡-100㎡",
        telephone: "15935974325"
      },
      {
        store_info_title: "教育培训 培训机构 奥运村 朝阳 100㎡-200㎡",
        telephone: "15601071888"
      },
      {
        store_info_title: "求租 朝阳 50㎡-100㎡ 餐馆",
        telephone: "13269773629"
      },
      {
        store_info_title: "超市百货 超市 其他 其他 100㎡-200㎡",
        telephone: "13011180005"
      },
      {
        store_info_title: "餐饮美食 餐馆 奥运村 朝阳 100㎡-200㎡",
        telephone: "15523402555"
      },
      {
        store_info_title: "美容美发 美容院 其他 丰台 100㎡-200㎡",
        telephone: "13979427166"
      },
      {
        store_info_title: "美容美发 美容院 奥运村 朝阳 100㎡-200㎡",
        telephone: "13383348623"
      },
      {
        store_info_title: "美容美发 美容院 奥运村 朝阳 50㎡-100㎡",
        telephone: "18032954447"
      },
      {
        store_info_title: "休闲娱乐 足浴 其他 丰台 100㎡-200㎡",
        telephone: "18018698428"
      },
      {
        store_info_title: "餐饮美食 餐馆 奥运村 朝阳 100㎡-200㎡",
        telephone: "13161248287"
      },
      {
        store_info_title: "超市百货 超市 城子街道 门头沟 100㎡-200㎡",
        telephone: "18813048397"
      },
      {
        store_info_title: "酒店宾馆 宾馆酒店 其他 顺义 500㎡以上",
        telephone: "18601115870"
      },
      {
        store_info_title: "教育培训 培训机构 其他 顺义 100㎡-200㎡",
        telephone: "15611333763"
      },
      {
        store_info_title: "餐饮美食 冷饮甜品店 其他 顺义 20㎡-50㎡",
        telephone: "13581882932"
      },
      {
        store_info_title: "美容美发 美发店 其他 其他 50㎡-100㎡",
        telephone: "17801071184"
      },
      {
        store_info_title: "休闲娱乐 儿童乐园 其他 其他 500㎡以上",
        telephone: "18583229286"
      },
      {
        store_info_title: "餐饮美食 餐馆 奥运村 朝阳 200㎡-500㎡",
        telephone: "13718291029"
      },
      {
        store_info_title: "餐饮美食 餐馆 北大清华 海淀 100㎡-200㎡",
        telephone: "15727599158"
      },
      {
        store_info_title: "超市百货 超市 其他 其他 200㎡-500㎡",
        telephone: "17530256615"
      },
      {
        store_info_title: "超市百货 超市 其他 其他 200㎡-500㎡",
        telephone: "18035846588"
      }
    ];
    console.log(result);
    return result;
  }

  async main() {
    this.log(`>>>main`)
    let infoList = await this.getData();
    await wx.start()
    this.roomList = await wx.findAll('店之家');
    console.log(this.roomList);
    if (this.roomList && this.roomList.length) {
      for (let i = 0; i < infoList.length; i++) {
        let msg = `${infoList[i].store_info_title} ${infoList[i].telephone}`
        this.log(msg)
        for (let j = 0; j < this.roomList; j++) {
          await this.roomList[j].say(msg)
          await this.sleep(2000)
        }
      }
    }
    console.log(666);
  }
}

new Wechaty().main();
