# lcx58
1.从数据库获house_list表获取一遍没有被block并且用户名存在的数据 v
2.把这条数据block字段更新成1
3.根据用户名查找cookie表数据
4.如果查找到cookie信息，就进行setcookie操作
3.用用户名密码进行登录
4.如果登录出现异常，把异常状态记录到log表，结束本次流程回到1
5.登录成功后跳转到房屋列表页面，根据房屋id查找对应元素
--如果没有查找到，记录状态，结束本次流程回到1
--如果查找到，获取当前房屋信息的状态并更细状态到数据库
--免费刷新：直接刷新			0
--发布超过30天：发新帖		3030
--7天内超过4次:重新编辑		3070
--免费刷新用完：不管 			3100
--个人删除 					3404
--需返回修改 				3401
--订单异常					3500
--审核不通过 				3501
--未实名认证 				4001
--认证超时 					4002

//TODO
发帖，重新编辑
//1
