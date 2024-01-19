## 2.0.1（2024-01-19）

- fix: 修复提取小程序链接时转发消息的JSON报错。

## 2.0.0（2023-10-28）

- 适配主项目 `3.x` 版本

## 2023/06/12

- 添加提取QQ小程序原始链接的功能。

## 2023/03/23

- ⚠️适配主项目 `2.9.3` 版本 ⚠️。

## 2022/10/07

- 支持插件的别名更新; catch 消息中的指令检测错误（虽然不知道怎么产生的，catch 就完了）

## 2022/09/26

- atme 判断优化，使用 oicq 消息中的 atme 作为判断依据；添加回复消息的 CQ 字符串移除功能；

## 2022/08/31

- 增加禁言/解禁用户功能；增加踢出群聊功能；增加设置/移除退群提醒功能。

## 2022/07/28

- 修复屏蔽词使用正则时被 QQ 转义导致无法生效的问题。

## 2022/07/08

- 增加群聊退出监听，BOT 退出群聊时移除该群的新成员入群监听和屏蔽词。

## 2022/07/07

- 欢迎词指令修改为仅在群聊使用，群里使用指令的权限修改为群管理员使用。

## 2022/06/23

- fixed: 修复使用AT指令时会将消息全部替换为空导致继续匹配屏蔽词的问题

## 2022/06/09

- 添加 `#banword` 和 `#fwl` 指令来管理群聊屏蔽词。

## 2022/04/13 规范 `cmdKey`

- 本次更新为了规范 `cmdKey` 更改了 `cmdKey`的前缀。