// https://wlasd4622.github.io/lcx58/common/58.js
function getHouseDetail() {
  //标题
  var title = $('.house-title h1').text().trim().substr(0, 30);
  //图片列表
  var picList = $('#leftImg li').map((i, item) => {
    return $(item).data('value')
  }).toArray();
  //租金
  var moneyNum = $('span.house_basic_title_money_num').text();
  //租金单位
  var moneyNumUnit = $('span.house_basic_title_money_unit').text();
  //出租
  var numChuZu = $('span.house_basic_title_money_num_chuzu').text();
  //出租单位
  var numChuZuUnit = $('span.house_basic_title_money_unit_chuzu').text();
  //平均每平米多少元
  var avrageMoney = $('span.house_basic_title_money_num_chushou').text().split('元')[0] || 0
  var avrageMoneyUnit = avrageMoney ? ('元' + $('span.house_basic_title_money_num_chushou').text().split('元')[1]) : ''
  //转让费
  var transferFee = parseFloat($('span.house_basic_title_money_zrf').text()) || 0
  //转让费单位
  var transferFeeUnit = $('span.house_basic_title_money_zrf').text().replace(transferFee, '')
  //baseContent
  var baseContent = $(`<div>${$('ul.house_basic_title_content').html().replace(/[\n\t\r]/g, '').replace(/\&nbsp\;/g, '')}</div>`);
  //面积
  var span = baseContent.find('span:contains(面积)').next().text().trim().replace(/\s/g, '');
  var area = span.match(/\d+/)[0];
  var areaUnit = span.match(/\d+(.*)/)[1];
  //类型
  var span = baseContent.find('span:contains(类型)').next().text().trim().replace(/\s/g, '');
  var type = span.split('-')[0];
  //是否临街
  var isStreet = span.split('-')[1];
  //楼层
  var span = baseContent.find('span:contains(楼层)').next().text().trim().replace(/\s/g, '');
  var curFloor = parseInt(span.split('/')[0]);
  var totalFloot = span.split('/')[1].match(/\d+/)[0];
  //规格
  var span = baseContent.find('span:contains(规格)').next().text().trim().replace(/\s/g, '');
  //面宽
  var sWidth = parseFloat(span.split('、')[0].replace('面宽', ''));
  //进深
  var sDeep = parseFloat(span.split('、')[1].replace('进深', ''));
  //层高
  var sHeight = parseFloat(span.split('、')[2].replace('层高', ''));
  //状态
  var status = baseContent.find('span:contains(状态)').next().text().trim().replace(/\s/g, '');
  //付款方式
  var span = baseContent.find('span:contains(付款方式)').next().text().trim().replace(/\s/g, '');
  var payType1 = span && span.match(/(\d+)/g)[0];
  var payType2 = span && span.match(/(\d+)/g)[1];
  //经营行业
  var span = baseContent.find('span:contains(经营行业)').next().text().trim().replace(/\s/g, '');
  var industry = span;
  //起租期
  var span = baseContent.find('span:contains(起租期)').next().text().trim().replace(/\s/g, '');
  var minMonth = span && span.match(/\d+/)[0]
  //剩余租期
  var span = parseInt(baseContent.find('span:contains(剩余租期)').next().text().trim().replace(/\s/g, '')) || 0;
  var endMonth = span;
  //客流
  var span = baseContent.find('span:contains(客流)').next().text().trim().replace(/\s/g, '');
  var passengerFlow = span;
  //位置
  var span = baseContent.find('span:contains(位置)').parent().find('span,a').toArray();
  var address1 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(1).text();
  var address2 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(2).text();
  var address3 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(3).text().trim()
  //----------------------------
  //姓名
  var name = $('.agent-name').text().trim().split('(')[0];
  //是否是个人
  var isSingle = $('.agent-name').text().trim().indexOf('个人') > -1 ? true : false;
  //phone
  var phone = $('p.phone-num').text();
  //phoneAddress
  var phoneAddress = $('.phone-belong').text().replace('电话归属地 :', '').trim()
  //配套
  var peotao = $('#peitao li.peitao-on').toArray().map(item => {
    return $(item).text().trim()
  });
  //描述
  var describe = $('#generalSound .general-item-wrap').html().trim();
  //houseDetailData
  window.houseDetailData = {
    title, //标题
    picList, //图片列表
    moneyNum, //租金
    moneyNumUnit, //租金单位
    numChuZu, //出租
    numChuZuUnit, //出租单位
    avrageMoney, //平均每平米多少元
    avrageMoneyUnit, //平均每平米多少元单位
    transferFee, //转让费
    transferFeeUnit, //转让费单位
    area, //面积
    areaUnit, //面积单位
    type, //类型
    isStreet, //是否临街
    curFloor, //当前层
    totalFloot, //总楼层
    sWidth, //面宽
    sDeep, //进深
    sHeight, //层高
    status, //状态
    payType1, //付款方式1
    payType2, //付款方式2
    industry, //经营行业
    minMonth, //起租期
    endMonth, //剩余租期
    passengerFlow, //客流
    address1, //位置1
    address2, //位置2
    address3, //位置3
    name, //姓名
    isSingle, //是否是个人
    phone, //phone
    phoneAddress, //phoneAddress
    peotao, //配套
    describe, //描述
  }
  window.houseDetailValue = encodeURIComponent(JSON.stringify(houseDetailData));
  return window.houseDetailValue || ''
}

function addHouseInfoData(code) {
  window.houseDetailData = JSON.parse(decodeURIComponent(`${code}`))

  //分类  商铺租售/生意转让
  //
  //出租，转让，出售
  if (houseDetailData.title.indexOf("转让") > -1) {
    $('[name=fenlei] [data-value=511571]').click();
    //转让费
    $('[name=params_214] input').val(houseDetailData.transferFee)
    //剩余租期
    $('[name=params_215] input').val(houseDetailData.endMonth)
  } else if (houseDetailData.title.indexOf("出租") > -1) {
    $('[name=fenlei] [data-value=511570]').click();
    $('[name=type] [data-value="2"]').click();
  } else if (houseDetailData.title.indexOf("出售") > -1) {
    $('[name=fenlei] [data-value=511570]').click();
    $('[name=type] [data-value="0"]').click();
  }
  // 商铺类型
  $('[name=params_204] .optiondef li:contains(' + houseDetailData.type.substr(0, 3) + ')').click();
  //商铺性质
  $('[name=params_122] .optiondef li[val=2]').click()
  //当前状态
  $('[name=params_205] label:contains(' + houseDetailData.status + ')').click()
  //经营行业
  $('[name=params_22701] .optiondef li:contains(' + houseDetailData.industry + ')').click();
  $('[name=params_20601] .optiondef li:eq(1)').click();

  //建筑面积
  $('[name=mianJi] input').val(houseDetailData.area);
  //楼层
  $('[name=zongLouCeng] input').val(houseDetailData.totalFloot)
  $('[name=suoZaiLouCeng] input').val(houseDetailData.curFloor)
  if (houseDetailData.totalFloot > 1) {
    //多层
    $('[name=params_109] .optiondef li:contains(多层)').click()
    $('[name=params_219] input').val(houseDetailData.curFloor)
  } else {
    //单层
    $('[name=params_109] .optiondef li:contains(单层)').click()
  }
  //面宽
  $('[name=params_207] input').val(houseDetailData.sWidth);
  //层高
  $('[name=params_208] input').val(houseDetailData.sHeight);
  //进深
  $('[name=params_209] input').val(houseDetailData.sDeep);
  //是否临街
  houseDetailData.isStreet === '临街' ? $('[name=params_211] [data-value]:eq(0)').click() : $('[name=params_211] [data-value]:eq(1)').click();
  // 商铺配套
  houseDetailData.peotao.map(name => {
    $('[name=params_110] label:contains(' + name + ')').click();
  })
  //商铺位置
  $('[name=localArea01] .optiondef li:contains(' + houseDetailData.address1.replace('区', '') + ')').click();
  $('[name=localDiduan01] .optiondef li:contains(' + houseDetailData.address2 + ')').click();
  $('[name=xiangXiDiZhi] input').val(houseDetailData.address3)
  //客流人群
  $('[name=params_210] label:contains(' + houseDetailData.passengerFlow + ')').click();
  //租金
  $('[name=jiaGe05] input').val(houseDetailData.moneyNum);
  //租金单位
  $('[name=jiageDanwei] .optiondef li:contains(' + houseDetailData.moneyNumUnit + ')').click();
  //支付方式
  $('[name=params_119] input').val(houseDetailData.payType1);
  $('[name=params_118] input').val(houseDetailData.payType2);
  //起租期
  $('[name=params_116] input').val(houseDetailData.minMonth || 1);
  //免租期
  //
  //标题
  $('[name=title] input').val(houseDetailData.title.substr(0, 30));
  //描述
  $('#edui1 iframe').contents().find('body').html(houseDetailData.describe);
  //上传图片
  //
  //联系人
  $('[name=contactName] input').val(houseDetailData.name)
  //联系电话
  $('[name=phone] input').val(houseDetailData.phone)


  console.log(houseDetailData);
}

function getAddHosueInfoStatus() {
  var status = -8930
  var paytips = $('.paytips').text().replace(/[\s\t\n]/g, '');
  if (paytips.indexOf('发帖权限已用尽') > -1) {
    status = 3513
  } else if (paytips.match(/本月还可免费发帖(\d+)条/) && paytips.match(/本月还可免费发帖(\d+)条/)[1] && parseInt(paytips.match(/本月还可免费发帖(\d+)条/)[1])) {
    status = 3514
  }
  return status
}
// var houseDetailData = {
//   "title": "(转让) 双碑酒楼餐饮 火锅店转让串串店转让江湖菜商铺门面转",
//   "picList": ["https://pic3.58cdn.com.cn/p1/big/n_v20de9988050c442d7bbf34bfd7371a0ac.jpg?w=640&h=480&crop=1", "https://pic1.58cdn.com.cn/p1/big/n_v237ff3eb7ca1c4b90aa1811b4ad5b6f2c.jpg?w=640&h=480&crop=1", "https://pic4.58cdn.com.cn/p1/big/n_v2a9cb10323594470ca1961d4bea5f5a4d.jpg?w=640&h=480&crop=1"],
//   "moneyNum": "12000",
//   "moneyNumUnit": "元/月",
//   "numChuZu": "",
//   "numChuZuUnit": "",
//   "avrageMoney": 0,
//   "avrageMoneyUnit": "",
//   "transferFee": 12,
//   "transferFeeUnit": "万元",
//   "area": "155",
//   "areaUnit": "㎡",
//   "type": "商业街商铺",
//   "isStreet": "临街",
//   "curFloor": 1,
//   "totalFloot": "1",
//   "sWidth": 8,
//   "sDeep": 22,
//   "sHeight": 5,
//   "status": "经营中",
//   "payType1": "1",
//   "payType2": "6",
//   "minMonth": "",
//   "endMonth": 6,
//   "passengerFlow": "其他",
//   "address1": "海淀",
//   "address2": "北京大学",
//   "address3": "美丽·阳光家园",
//   "name": "曾女士",
//   "isSingle": true,
//   "phone": "17323975199",
//   "phoneAddress": "重庆",
//   "peotao": ["停车位", "天然气", "上水", "下水", "排烟", "排污"],
//   "describe": "<p>本店位于沙坪坝井口镇美丽阳光家园，社区底商，商业街临街底商,人。流。量大，店门口就是亿客来超市 方圆5公里,商务综合体 ，稳定10万人消费，学校众多 二塘小学、重庆职工会计专科学校、重庆六十四中、阳光家园小学等临近公交车站，交通便利，店铺配套完善，消费群体集中，客源稳定，各项设备水电网齐全，现带所有设备整转，还有天然气，租金便宜无压力，客源稳定目前做的是串串生意稳定因个人原因现将餐厅转让，有诚意者电话,可以实地考察！来店麻烦不要打扰我的员工和客人，谢谢理解诚心转让中介快转公司无诚意者勿扰\n                    <br><br></p><p name=\"data_2\">联系我时，请说是在58同城上看到的，谢谢！</p>"
// }

//%7B%22title%22%3A%22(%E8%BD%AC%E8%AE%A9)%20%E5%8F%8C%E7%A2%91%E9%85%92%E6%A5%BC%E9%A4%90%E9%A5%AE%20%E7%81%AB%E9%94%85%E5%BA%97%E8%BD%AC%E8%AE%A9%E4%B8%B2%E4%B8%B2%E5%BA%97%E8%BD%AC%E8%AE%A9%E6%B1%9F%E6%B9%96%E8%8F%9C%E5%95%86%E9%93%BA%E9%97%A8%E9%9D%A2%E8%BD%AC%22%2C%22picList%22%3A%5B%22https%3A%2F%2Fpic3.58cdn.com.cn%2Fp1%2Fbig%2Fn_v20de9988050c442d7bbf34bfd7371a0ac.jpg%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic1.58cdn.com.cn%2Fp1%2Fbig%2Fn_v237ff3eb7ca1c4b90aa1811b4ad5b6f2c.jpg%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2a9cb10323594470ca1961d4bea5f5a4d.jpg%3Fw%3D640%26h%3D480%26crop%3D1%22%5D%2C%22moneyNum%22%3A%2212000%22%2C%22moneyNumUnit%22%3A%22%E5%85%83%2F%E6%9C%88%22%2C%22numChuZu%22%3A%22%22%2C%22numChuZuUnit%22%3A%22%22%2C%22avrageMoney%22%3A0%2C%22avrageMoneyUnit%22%3A%22%22%2C%22transferFee%22%3A12%2C%22transferFeeUnit%22%3A%22%E4%B8%87%E5%85%83%22%2C%22area%22%3A%22155%22%2C%22areaUnit%22%3A%22%E3%8E%A1%22%2C%22type%22%3A%22%E5%95%86%E4%B8%9A%E8%A1%97%E5%95%86%E9%93%BA%22%2C%22isStreet%22%3A%22%E4%B8%B4%E8%A1%97%22%2C%22curFloor%22%3A1%2C%22totalFloot%22%3A%221%22%2C%22sWidth%22%3A8%2C%22sDeep%22%3A22%2C%22sHeight%22%3A5%2C%22status%22%3A%22%E7%BB%8F%E8%90%A5%E4%B8%AD%22%2C%22payType1%22%3A%221%22%2C%22payType2%22%3A%226%22%2C%22industry%22%3A%22%E9%A4%90%E9%A5%AE%E7%BE%8E%E9%A3%9F%22%2C%22minMonth%22%3A%22%22%2C%22endMonth%22%3A6%2C%22passengerFlow%22%3A%22%E5%85%B6%E4%BB%96%22%2C%22address1%22%3A%22%E6%B2%99%E5%9D%AA%E5%9D%9D%E5%8C%BA%22%2C%22address2%22%3A%22%E4%BA%95%E5%8F%A3%22%2C%22address3%22%3A%22%E7%BE%8E%E4%B8%BD%C2%B7%E9%98%B3%E5%85%89%E5%AE%B6%E5%9B%AD%22%2C%22name%22%3A%22%E6%9B%BE%E5%A5%B3%E5%A3%AB%22%2C%22isSingle%22%3Atrue%2C%22phone%22%3A%2217323975199%22%2C%22phoneAddress%22%3A%22%E9%87%8D%E5%BA%86%22%2C%22peotao%22%3A%5B%22%E5%81%9C%E8%BD%A6%E4%BD%8D%22%2C%22%E5%A4%A9%E7%84%B6%E6%B0%94%22%2C%22%E4%B8%8A%E6%B0%B4%22%2C%22%E4%B8%8B%E6%B0%B4%22%2C%22%E6%8E%92%E7%83%9F%22%2C%22%E6%8E%92%E6%B1%A1%22%5D%2C%22describe%22%3A%22%3Cp%3E%E6%9C%AC%E5%BA%97%E4%BD%8D%E4%BA%8E%E6%B2%99%E5%9D%AA%E5%9D%9D%E4%BA%95%E5%8F%A3%E9%95%87%E7%BE%8E%E4%B8%BD%E9%98%B3%E5%85%89%E5%AE%B6%E5%9B%AD%EF%BC%8C%E7%A4%BE%E5%8C%BA%E5%BA%95%E5%95%86%EF%BC%8C%E5%95%86%E4%B8%9A%E8%A1%97%E4%B8%B4%E8%A1%97%E5%BA%95%E5%95%86%2C%E4%BA%BA%E3%80%82%E6%B5%81%E3%80%82%E9%87%8F%E5%A4%A7%EF%BC%8C%E5%BA%97%E9%97%A8%E5%8F%A3%E5%B0%B1%E6%98%AF%E4%BA%BF%E5%AE%A2%E6%9D%A5%E8%B6%85%E5%B8%82%20%E6%96%B9%E5%9C%865%E5%85%AC%E9%87%8C%2C%E5%95%86%E5%8A%A1%E7%BB%BC%E5%90%88%E4%BD%93%20%EF%BC%8C%E7%A8%B3%E5%AE%9A10%E4%B8%87%E4%BA%BA%E6%B6%88%E8%B4%B9%EF%BC%8C%E5%AD%A6%E6%A0%A1%E4%BC%97%E5%A4%9A%20%E4%BA%8C%E5%A1%98%E5%B0%8F%E5%AD%A6%E3%80%81%E9%87%8D%E5%BA%86%E8%81%8C%E5%B7%A5%E4%BC%9A%E8%AE%A1%E4%B8%93%E7%A7%91%E5%AD%A6%E6%A0%A1%E3%80%81%E9%87%8D%E5%BA%86%E5%85%AD%E5%8D%81%E5%9B%9B%E4%B8%AD%E3%80%81%E9%98%B3%E5%85%89%E5%AE%B6%E5%9B%AD%E5%B0%8F%E5%AD%A6%E7%AD%89%E4%B8%B4%E8%BF%91%E5%85%AC%E4%BA%A4%E8%BD%A6%E7%AB%99%EF%BC%8C%E4%BA%A4%E9%80%9A%E4%BE%BF%E5%88%A9%EF%BC%8C%E5%BA%97%E9%93%BA%E9%85%8D%E5%A5%97%E5%AE%8C%E5%96%84%EF%BC%8C%E6%B6%88%E8%B4%B9%E7%BE%A4%E4%BD%93%E9%9B%86%E4%B8%AD%EF%BC%8C%E5%AE%A2%E6%BA%90%E7%A8%B3%E5%AE%9A%EF%BC%8C%E5%90%84%E9%A1%B9%E8%AE%BE%E5%A4%87%E6%B0%B4%E7%94%B5%E7%BD%91%E9%BD%90%E5%85%A8%EF%BC%8C%E7%8E%B0%E5%B8%A6%E6%89%80%E6%9C%89%E8%AE%BE%E5%A4%87%E6%95%B4%E8%BD%AC%EF%BC%8C%E8%BF%98%E6%9C%89%E5%A4%A9%E7%84%B6%E6%B0%94%EF%BC%8C%E7%A7%9F%E9%87%91%E4%BE%BF%E5%AE%9C%E6%97%A0%E5%8E%8B%E5%8A%9B%EF%BC%8C%E5%AE%A2%E6%BA%90%E7%A8%B3%E5%AE%9A%E7%9B%AE%E5%89%8D%E5%81%9A%E7%9A%84%E6%98%AF%E4%B8%B2%E4%B8%B2%E7%94%9F%E6%84%8F%E7%A8%B3%E5%AE%9A%E5%9B%A0%E4%B8%AA%E4%BA%BA%E5%8E%9F%E5%9B%A0%E7%8E%B0%E5%B0%86%E9%A4%90%E5%8E%85%E8%BD%AC%E8%AE%A9%EF%BC%8C%E6%9C%89%E8%AF%9A%E6%84%8F%E8%80%85%E7%94%B5%E8%AF%9D%2C%E5%8F%AF%E4%BB%A5%E5%AE%9E%E5%9C%B0%E8%80%83%E5%AF%9F%EF%BC%81%E6%9D%A5%E5%BA%97%E9%BA%BB%E7%83%A6%E4%B8%8D%E8%A6%81%E6%89%93%E6%89%B0%E6%88%91%E7%9A%84%E5%91%98%E5%B7%A5%E5%92%8C%E5%AE%A2%E4%BA%BA%EF%BC%8C%E8%B0%A2%E8%B0%A2%E7%90%86%E8%A7%A3%E8%AF%9A%E5%BF%83%E8%BD%AC%E8%AE%A9%E4%B8%AD%E4%BB%8B%E5%BF%AB%E8%BD%AC%E5%85%AC%E5%8F%B8%E6%97%A0%E8%AF%9A%E6%84%8F%E8%80%85%E5%8B%BF%E6%89%B0%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%3Cp%20name%3D%5C%22data_2%5C%22%3E%E8%81%94%E7%B3%BB%E6%88%91%E6%97%B6%EF%BC%8C%E8%AF%B7%E8%AF%B4%E6%98%AF%E5%9C%A858%E5%90%8C%E5%9F%8E%E4%B8%8A%E7%9C%8B%E5%88%B0%E7%9A%84%EF%BC%8C%E8%B0%A2%E8%B0%A2%EF%BC%81%3C%2Fp%3E%22%7D
