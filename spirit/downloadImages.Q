Function download(url)
    Set obj1 = CreateObject("msxml2.xmlhttp")
    Set obj2 = CreateObject("adodb.stream")
    obj1.open "get",url,False
    obj1.send
    temp = obj1.responseBody
    obj2.Type = 1
    obj2.Mode = 3
    obj2.Open
    obj2.Write(temp)
    obj2.SaveToFile "d:\temp\"+Plugin.Encrypt.Md5String(url)+".png",2 //2的意思是已有则覆盖,后面是保存路径。
    obj2.Close 
End Function 

Call download("https://pic7.58cdn.com.cn/anjuke_58/716f5e2b918ed7e5090a9663341ddcd9")
Call download("https://pic7.58cdn.com.cn/anjuke_58/693050bc19e3f287092b90c67d071b5f")
Call download("https://pic1.58cdn.com.cn/anjuke_58/41c25075a4762742c47a81e6d1c607a3")
Call download("https://pic8.58cdn.com.cn/anjuke_58/73a50d192f9833a3119da2e5a9fd3097")
Call download("https://pic8.58cdn.com.cn/anjuke_58/68d6371f25f8c4d9b06edb7550f877af")
Call download("https://pic2.58cdn.com.cn/anjuke_58/017dc19f851a03ca541fb4f593c1a668")
Call download("https://pic3.58cdn.com.cn/anjuke_58/09b599d2424f092c94d621215fd22521")