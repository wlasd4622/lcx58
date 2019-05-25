var cookieArr = [{
        "domain": ".58.com",
        "expirationDate": 1590307716,
        "hostOnly": false,
        "httpOnly": false,
        "name": "58tj_uuid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "4967ea49-02d6-40f9-9aa8-451ac8946d93",
        "id": 1
    },
    {
        "domain": ".58.com",
        "expirationDate": 1575683019,
        "hostOnly": false,
        "httpOnly": false,
        "name": "als",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "0",
        "id": 2
    },
    {
        "domain": ".58.com",
        "expirationDate": 1607219018.875045,
        "hostOnly": false,
        "httpOnly": false,
        "name": "id58",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "c5/nn1wJ0HkvkWfLBDKlAg==",
        "id": 3
    },
    {
        "domain": ".58.com",
        "expirationDate": 1558773516,
        "hostOnly": false,
        "httpOnly": false,
        "name": "init_refer",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "http%253A%252F%252Fpost.58.com%252F",
        "id": 4
    },
    {
        "domain": ".58.com",
        "expirationDate": 1558773516,
        "hostOnly": false,
        "httpOnly": false,
        "name": "new_session",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1",
        "id": 5
    },
    {
        "domain": ".58.com",
        "expirationDate": 1590307716,
        "hostOnly": false,
        "httpOnly": false,
        "name": "new_uv",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "2",
        "id": 6
    },
    {
        "domain": ".58.com",
        "expirationDate": 1859507117,
        "hostOnly": false,
        "httpOnly": false,
        "name": "ppStore_fingerprint",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1882B9B1D964C32CB10C4B7D629167F55D8CCD4E8F671F72%EF%BC%BF1544147117709",
        "id": 7
    },
    {
        "domain": ".58.com",
        "expirationDate": 1558773516,
        "hostOnly": false,
        "httpOnly": false,
        "name": "spm",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "",
        "id": 8
    },
    {
        "domain": ".58.com",
        "expirationDate": 1558773516,
        "hostOnly": false,
        "httpOnly": false,
        "name": "utm_source",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "",
        "id": 9
    },
    {
        "domain": ".58.com",
        "expirationDate": 1575683213,
        "hostOnly": false,
        "httpOnly": false,
        "name": "xxzl_deviceid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "EjbFf2scr%2Bh9e8qUJVtECY5KZCMli1e3E80KgUpOOSqXugXQ5vWoclIm5%2Fx64sfp",
        "id": 10
    },
    {
        "domain": ".58.com",
        "expirationDate": 1575683213,
        "hostOnly": false,
        "httpOnly": false,
        "name": "xxzl_smartid",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "eeabfcc3b864806e27f68ad7253ec28b",
        "id": 11
    }
]

function setCookie(name, value, domain = '58.com', expirationDate) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    let cookie = name + '=' + value + ';expires=' + new Date(1575683213 * 1000).toGMTString() + '; path=/;';
    if (domain) {
        cookie += 'domain=' + domain + ';';
    }
    console.log(cookie);
    document.cookie = cookie;
};

cookieArr.map(item => {
    let {
        domain,
        name,
        value,
        expirationDate
    } = item;
    if (expirationDate) {
        setCookie(name, value, null, expirationDate)
    }
})

 
function clearAllCookie() {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
    if (keys) {  
        for (var i =  keys.length; i--;) {
            document.cookie = keys[i] + '=0; expire=' + date.toGMTString() + '; path=/;';
            document.cookie = keys[i] + '=0; expire=' + date.toGMTString() + '; path=/;domain=.58.com';
        }
    }
}