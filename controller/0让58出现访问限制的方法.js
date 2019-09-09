// #让58出现访问限制的方法

let urlArr = $('.pic a').toArray().map(item => $(item).attr('href')).filter(href => href.includes('shangpu'));

for (let i = 0; i < urlArr.length; i++) {
  const url = urlArr[i];
  setTimeout(() => {
    console.log(`${i}/${urlArr.length}`);
    console.log(url);
    let iframe = $('<iframe>')
    $('body').append(iframe)
    iframe.attr('src',url)
  },500*i)
}
