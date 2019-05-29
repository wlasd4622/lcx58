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
  window.houseDetaulData = JSON.parse(decodeURIComponent(`${code}`))
  console.log(houseDetaulData);
}
// getHouseDetail();
// houseDetailData;
// //https://bj.58.com/shangpu/38195679342595x.shtml
// //%7B%22title%22%3A%22(%E5%87%BA%E7%A7%9F)%20%E4%B8%9C%E5%85%B3%20%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%20%E5%8C%97%E8%BF%90%E6%B2%B3%E8%A5%BF%E5%9C%B0%E9%93%81%20%E5%95%86%E9%93%BA%20%E4%B8%B4%E8%A1%97%22%2C%22picList%22%3A%5B%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2F0a60a0f8e61c479e805983fa7f54ccf5%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic5.58cdn.com.cn%2Fanjuke_58%2Fd06584290210958c716bc705342581ea%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2F8710722c1f649ccaa7a204809d3b4db7%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2Fe68622b04a78b4f4bb9af2eb6acfbd34%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2Fa4b7b375f49e5c915e11384e19aa52a3%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic1.58cdn.com.cn%2Fanjuke_58%2Ff243fec9892abf825cf957e5ca478e06%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2F6e187eea0eefff4217f5feec68867960%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic1.58cdn.com.cn%2Fanjuke_58%2Ffe30dc36f605d9878d3678a152edb312%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2Fbf1e4a0d6e952398a9fa02d52056c3b3%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2F2ee12eaf1dd700862a94befd93742e99%3Fw%3D640%26h%3D480%26crop%3D1%22%5D%2C%22moneyNum%22%3A%2240000%22%2C%22moneyNumUnit%22%3A%22%E5%85%83%2F%E6%9C%88%22%2C%22numChuZu%22%3A%223.17%22%2C%22numChuZuUnit%22%3A%22%E5%85%83%2F%E3%8E%A1%2F%E5%A4%A9%22%2C%22avrageMoney%22%3A%22%22%2C%22avrageMoneyUnit%22%3A%22%E5%85%83undefined%22%2C%22transferFee%22%3A0%2C%22transferFeeUnit%22%3A%22%22%2C%22area%22%3A%22420%22%2C%22areaUnit%22%3A%22%E3%8E%A1%22%2C%22type%22%3A%22%E7%A4%BE%E5%8C%BA%E5%BA%95%E5%95%86%22%2C%22isStreet%22%3A%22%E4%B8%B4%E8%A1%97%22%2C%22curFloor%22%3A1%2C%22totalFloot%22%3A%222%22%2C%22sWidth%22%3A5%2C%22sDeep%22%3A20%2C%22sHeight%22%3A4%2C%22status%22%3A%22%E7%A9%BA%E7%BD%AE%E4%B8%AD%22%2C%22payType1%22%3A%226%22%2C%22payType2%22%3A%222%22%2C%22minMonth%22%3A%2212%22%2C%22endMonth%22%3A0%2C%22passengerFlow%22%3A%22%E6%9A%82%E6%97%A0%E6%95%B0%E6%8D%AE%22%2C%22address1%22%3A%22%E9%80%9A%E5%B7%9E%E5%8C%BA%22%2C%22address2%22%3A%22%E7%8E%89%E6%A1%A5%22%2C%22address3%22%3A%22%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%E5%AE%B6%E5%9B%AD%22%2C%22name%22%3A%22%E8%B0%B7%E6%A3%AE%22%2C%22isSingle%22%3Afalse%2C%22phone%22%3A%2218001262350%22%2C%22phoneAddress%22%3A%22%E5%8C%97%E4%BA%AC%22%2C%22peotao%22%3A%5B%22%E4%B8%AD%E5%A4%AE%E7%A9%BA%E8%B0%83%22%2C%22%E5%81%9C%E8%BD%A6%E4%BD%8D%22%2C%22%E7%BD%91%E7%BB%9C%22%2C%22%E6%9A%96%E6%B0%94%22%2C%22%E4%B8%8A%E6%B0%B4%22%2C%22%E4%B8%8B%E6%B0%B4%22%2C%22%E6%8E%92%E7%83%9F%22%2C%22%E6%8E%92%E6%B1%A1%22%2C%22380V%22%5D%2C%22describe%22%3A%22%E5%A4%A7%E4%BA%A7%E6%9D%83%26nbsp%3B%E7%8B%AC%E7%AB%8B%E6%A5%BC%E6%A2%AF%26nbsp%3B%E6%9C%89%E4%B8%80%E6%B6%88%26nbsp%3B%E4%B8%B4%E8%A1%97%26nbsp%3B%E5%9C%B0%E9%93%81%E5%95%86%E9%93%BA%20%3Cbr%3E%3Cp%3E%5Ct%3Cbr%3E%3C%2Fp%3E%3Cp%3E%5Ct%E4%BD%8D%E7%BD%AE%3A%E9%80%9A%E5%B7%9E%E4%B8%9C%E5%85%B3%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%E5%B0%8F%E5%8C%BA%E5%BA%95%E5%95%86%EF%BC%88%E5%8E%9F%E7%BA%A210%E5%81%A5%E8%BA%AB%EF%BC%89%3Cbr%3E%E5%87%BA%E7%A7%9F%E9%9D%A2%E7%A7%AF%3A400%E5%B9%B3%E7%B1%B3%EF%BC%88%E4%B8%80%E4%BA%8C%E5%B1%82%EF%BC%89%3Cbr%3E%3Cbr%3E%E6%8B%9B%E5%95%86%E9%A1%B9%E7%9B%AE%3A%E6%95%99%E8%82%B2%E5%9F%B9%E8%AE%AD%20%E4%BC%81%E4%B8%9A%E5%8A%9E%E5%85%AC%20%E5%85%BB%E7%94%9F%E7%BE%8E%E5%AE%B9%E7%AD%89%EF%BC%88%E9%A4%90%E9%A5%AE%E5%8B%BF%E6%89%B0%EF%BC%89%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%3Cp%3E%5Ct%E5%95%86%E9%93%BA%E4%BB%8B%E7%BB%8D%3A%E5%AF%B9%E9%9D%A2%E8%BF%90%E6%B2%B3%E5%9C%B0%E9%93%81%E5%87%BA%E5%85%A5%E5%8F%A3%EF%BC%8C%E4%B8%80%E5%B1%8280%E5%B9%B3%E7%B1%B3%EF%BC%8C%E4%BA%8C%E5%B1%82320%E5%B9%B3%E7%B1%B3%EF%BC%8C%E5%95%86%E4%B8%9A%E4%BA%A7%E6%9D%83%EF%BC%8C%E5%B1%95%E7%A4%BA%E9%9D%A2%E6%98%BE%E7%9C%BC%EF%BC%8C%E5%8D%81%E5%AD%97%E8%B7%AF%E5%8F%A3%E4%B8%AD%E5%BF%83%EF%BC%8C%E7%AE%80%E5%8D%95%E8%A3%85%E4%BF%AE%EF%BC%8C%E4%BA%BA%E6%B5%81%E5%A4%A7%EF%BC%8C%E6%B6%88%E8%B4%B9%E9%AB%98%EF%BC%8C%E7%A4%BE%E5%8C%BA%E4%BC%97%E5%A4%9A%EF%BC%81%3C%2Fp%3E%3Cp%3E%5Ct%E5%91%A8%E8%BE%B9%E6%9C%89%E4%B8%9C%E5%85%B3%E5%AE%9E%E9%AA%8C%E5%B0%8F%E5%AD%A6%EF%BC%8C%E5%B9%BC%E5%84%BF%E5%9B%AD%E5%A4%9A%E5%AE%B6%E3%80%82%3Cbr%3E%E5%87%BA%E7%A7%9F%E5%B9%B4%E9%99%90%3A3%203%E5%B9%B4%3Cbr%3E%3Cbr%3E%3Cbr%3E%3Cbr%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%3Cp%20name%3D%5C%22data_2%5C%22%3E%E8%81%94%E7%B3%BB%E6%88%91%E6%97%B6%EF%BC%8C%E8%AF%B7%E8%AF%B4%E6%98%AF%E5%9C%A858%E5%90%8C%E5%9F%8E%E4%B8%8A%E7%9C%8B%E5%88%B0%E7%9A%84%EF%BC%8C%E8%B0%A2%E8%B0%A2%EF%BC%81%3C%2Fp%3E%22%7D



// var houseDetaulData = JSON.parse(decodeURIComponent(`%7B%22title%22%3A%22(%E5%87%BA%E7%A7%9F)%20%E4%B8%9C%E5%85%B3%20%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%20%E5%8C%97%E8%BF%90%E6%B2%B3%E8%A5%BF%E5%9C%B0%E9%93%81%20%E5%95%86%E9%93%BA%20%E4%B8%B4%E8%A1%97%22%2C%22picList%22%3A%5B%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2F0a60a0f8e61c479e805983fa7f54ccf5%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic5.58cdn.com.cn%2Fanjuke_58%2Fd06584290210958c716bc705342581ea%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2F8710722c1f649ccaa7a204809d3b4db7%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2Fe68622b04a78b4f4bb9af2eb6acfbd34%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2Fa4b7b375f49e5c915e11384e19aa52a3%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic1.58cdn.com.cn%2Fanjuke_58%2Ff243fec9892abf825cf957e5ca478e06%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic2.58cdn.com.cn%2Fanjuke_58%2F6e187eea0eefff4217f5feec68867960%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic1.58cdn.com.cn%2Fanjuke_58%2Ffe30dc36f605d9878d3678a152edb312%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2Fbf1e4a0d6e952398a9fa02d52056c3b3%3Fw%3D640%26h%3D480%26crop%3D1%22%2C%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fanjuke_58%2F2ee12eaf1dd700862a94befd93742e99%3Fw%3D640%26h%3D480%26crop%3D1%22%5D%2C%22moneyNum%22%3A%2240000%22%2C%22moneyNumUnit%22%3A%22%E5%85%83%2F%E6%9C%88%22%2C%22numChuZu%22%3A%223.17%22%2C%22numChuZuUnit%22%3A%22%E5%85%83%2F%E3%8E%A1%2F%E5%A4%A9%22%2C%22avrageMoney%22%3A%22%22%2C%22avrageMoneyUnit%22%3A%22%E5%85%83undefined%22%2C%22transferFee%22%3A0%2C%22transferFeeUnit%22%3A%22%22%2C%22area%22%3A%22420%22%2C%22areaUnit%22%3A%22%E3%8E%A1%22%2C%22type%22%3A%22%E7%A4%BE%E5%8C%BA%E5%BA%95%E5%95%86%22%2C%22isStreet%22%3A%22%E4%B8%B4%E8%A1%97%22%2C%22curFloor%22%3A1%2C%22totalFloot%22%3A%222%22%2C%22sWidth%22%3A5%2C%22sDeep%22%3A20%2C%22sHeight%22%3A4%2C%22status%22%3A%22%E7%A9%BA%E7%BD%AE%E4%B8%AD%22%2C%22payType1%22%3A%226%22%2C%22payType2%22%3A%222%22%2C%22minMonth%22%3A%2212%22%2C%22endMonth%22%3A0%2C%22passengerFlow%22%3A%22%E6%9A%82%E6%97%A0%E6%95%B0%E6%8D%AE%22%2C%22address1%22%3A%22%E9%80%9A%E5%B7%9E%E5%8C%BA%22%2C%22address2%22%3A%22%E7%8E%89%E6%A1%A5%22%2C%22address3%22%3A%22%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%E5%AE%B6%E5%9B%AD%22%2C%22name%22%3A%22%E8%B0%B7%E6%A3%AE%22%2C%22isSingle%22%3Afalse%2C%22phone%22%3A%2218001262350%22%2C%22phoneAddress%22%3A%22%E5%8C%97%E4%BA%AC%22%2C%22peotao%22%3A%5B%22%E4%B8%AD%E5%A4%AE%E7%A9%BA%E8%B0%83%22%2C%22%E5%81%9C%E8%BD%A6%E4%BD%8D%22%2C%22%E7%BD%91%E7%BB%9C%22%2C%22%E6%9A%96%E6%B0%94%22%2C%22%E4%B8%8A%E6%B0%B4%22%2C%22%E4%B8%8B%E6%B0%B4%22%2C%22%E6%8E%92%E7%83%9F%22%2C%22%E6%8E%92%E6%B1%A1%22%2C%22380V%22%5D%2C%22describe%22%3A%22%E5%A4%A7%E4%BA%A7%E6%9D%83%26nbsp%3B%E7%8B%AC%E7%AB%8B%E6%A5%BC%E6%A2%AF%26nbsp%3B%E6%9C%89%E4%B8%80%E6%B6%88%26nbsp%3B%E4%B8%B4%E8%A1%97%26nbsp%3B%E5%9C%B0%E9%93%81%E5%95%86%E9%93%BA%20%3Cbr%3E%3Cp%3E%5Ct%3Cbr%3E%3C%2Fp%3E%3Cp%3E%5Ct%E4%BD%8D%E7%BD%AE%3A%E9%80%9A%E5%B7%9E%E4%B8%9C%E5%85%B3%E8%BF%90%E6%B2%B3%E6%98%8E%E7%8F%A0%E5%B0%8F%E5%8C%BA%E5%BA%95%E5%95%86%EF%BC%88%E5%8E%9F%E7%BA%A210%E5%81%A5%E8%BA%AB%EF%BC%89%3Cbr%3E%E5%87%BA%E7%A7%9F%E9%9D%A2%E7%A7%AF%3A400%E5%B9%B3%E7%B1%B3%EF%BC%88%E4%B8%80%E4%BA%8C%E5%B1%82%EF%BC%89%3Cbr%3E%3Cbr%3E%E6%8B%9B%E5%95%86%E9%A1%B9%E7%9B%AE%3A%E6%95%99%E8%82%B2%E5%9F%B9%E8%AE%AD%20%E4%BC%81%E4%B8%9A%E5%8A%9E%E5%85%AC%20%E5%85%BB%E7%94%9F%E7%BE%8E%E5%AE%B9%E7%AD%89%EF%BC%88%E9%A4%90%E9%A5%AE%E5%8B%BF%E6%89%B0%EF%BC%89%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%3Cp%3E%5Ct%E5%95%86%E9%93%BA%E4%BB%8B%E7%BB%8D%3A%E5%AF%B9%E9%9D%A2%E8%BF%90%E6%B2%B3%E5%9C%B0%E9%93%81%E5%87%BA%E5%85%A5%E5%8F%A3%EF%BC%8C%E4%B8%80%E5%B1%8280%E5%B9%B3%E7%B1%B3%EF%BC%8C%E4%BA%8C%E5%B1%82320%E5%B9%B3%E7%B1%B3%EF%BC%8C%E5%95%86%E4%B8%9A%E4%BA%A7%E6%9D%83%EF%BC%8C%E5%B1%95%E7%A4%BA%E9%9D%A2%E6%98%BE%E7%9C%BC%EF%BC%8C%E5%8D%81%E5%AD%97%E8%B7%AF%E5%8F%A3%E4%B8%AD%E5%BF%83%EF%BC%8C%E7%AE%80%E5%8D%95%E8%A3%85%E4%BF%AE%EF%BC%8C%E4%BA%BA%E6%B5%81%E5%A4%A7%EF%BC%8C%E6%B6%88%E8%B4%B9%E9%AB%98%EF%BC%8C%E7%A4%BE%E5%8C%BA%E4%BC%97%E5%A4%9A%EF%BC%81%3C%2Fp%3E%3Cp%3E%5Ct%E5%91%A8%E8%BE%B9%E6%9C%89%E4%B8%9C%E5%85%B3%E5%AE%9E%E9%AA%8C%E5%B0%8F%E5%AD%A6%EF%BC%8C%E5%B9%BC%E5%84%BF%E5%9B%AD%E5%A4%9A%E5%AE%B6%E3%80%82%3Cbr%3E%E5%87%BA%E7%A7%9F%E5%B9%B4%E9%99%90%3A3%203%E5%B9%B4%3Cbr%3E%3Cbr%3E%3Cbr%3E%3Cbr%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%3Cp%20name%3D%5C%22data_2%5C%22%3E%E8%81%94%E7%B3%BB%E6%88%91%E6%97%B6%EF%BC%8C%E8%AF%B7%E8%AF%B4%E6%98%AF%E5%9C%A858%E5%90%8C%E5%9F%8E%E4%B8%8A%E7%9C%8B%E5%88%B0%E7%9A%84%EF%BC%8C%E8%B0%A2%E8%B0%A2%EF%BC%81%3C%2Fp%3E%22%7D`))
