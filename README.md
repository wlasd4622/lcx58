# lcx58
> 文件功能介绍
- 58ganji.js:保持session有效
    - 每小时执行一次
    - 保持session有效
- task0.js:
    - 每天凌晨2点task2执行完毕开始执行
    - 刷新（编辑保存）
- task1.js:
    - 每天凌晨2点task2执行完毕开始执行
    - 推送帖子（上架）
- task2.js:
    - 每天凌晨2点开始执行
    - 更新infoid对应的houseId到数据库里
- task3.js:
    - 每天9点开始执行
    - 设置精选
- task4.js:
    - 每小时执行一次（时间区间10-16点）
    - 监听精选 是否超过当前设置的预算
- task5.js:
    - 每天19点执行
    - 取消精选
- main.js
    - 总任务

> log查看
- logs下面记录每个任务的日志按时间分开的方便查询

> 任务启动
- 双击执行当前目录下的run.bat
