本项目为 [Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT) 衍生插件，用于设置QQ群的入群欢迎词。

## 安装

在 `src/plugins`目录下使用下面的命令

```sh
git clone https://ghproxy.com/https://github.com/BennettChina/group_helper.git --depth=1
```

## 使用方法

欢迎词格式比如: `#sw 12345678 欢迎{}加入本群🎉`，  `{}`将会被替换成新群员的昵称。

```
# 设置欢迎词
命令: <header> sw <QQ群号> <欢迎词>
范围: 私聊
权限: BOT管理员 (Manager)

#启用或禁用欢迎词
命令: <header> we <on|off> <QQ群号>
范围: 私聊
权限: BOT管理 (Manager)
```