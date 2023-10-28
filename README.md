本项目为 [Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT) 衍生插件，用于辅助管理QQ群的插件。

## 安装

在 `src/plugins`目录下使用下面的命令

### 网好用这个

```sh
git clone https://github.com/BennettChina/group_helper.git
```

### 网差用这两个

```shell
git clone https://ghproxy.com/https://github.com/BennettChina/group_helper.git
```

```shell
git clone https://gitclone.com/github.com/BennettChina/group_helper.git
```

> 感谢[GitClone](https://gitclone.com/) 和 [GitHub Proxy](https://ghproxy.com/) 提供的镜像服务！

## 使用方法

欢迎词格式比如: `#sw 12345678 欢迎{}加入本群🎉`，  `{}`将会被替换成新群员的昵称。

```
# 设置欢迎词
命令: <header> sw <欢迎词>
范围: 群聊
权限: 群管理员

# 启用或禁用欢迎词
命令: <header> we <enable|disable>
范围: 群聊
权限: 群管理员

# 添加或移除屏蔽词（多个屏蔽词以英文逗号隔开，屏蔽词支持正则）
命令: <header> banword <add|remove> <屏蔽词>
范围: 私聊/群聊(私聊仅Master可用，用来设置全局屏蔽词)
权限: 群管理员

# 查看已设置的屏蔽词
命令: <header> fwl
范围: 私聊/群聊(私聊仅Master可用，用来查看已设置的全局屏蔽词)
权限: 群管理员

# 禁言群用户(禁言时间默认为分钟，也可使用5d5h5m的格式设置禁言时间，某项缺少也可以不设置如5d5m)
命令: <header> bu @xxx 10
范围: 群聊
权限: 群管理员

# 解禁群用户
命令: <header> ubu @xxx
范围: 群聊
权限: 群管理员

# 设置退群提醒消息模版，模版中可用参数为{}，将会被替换为用户名或QQ号。
命令: <header> dgn <消息模版>
范围: 群聊
权限: 群管理员

# 移除退群提醒
命令: <header> dgnc
范围: 群聊
权限: 群管理员

# 踢人
命令: <header> rgu @xxx
范围: 群聊
权限: 群管理员
```

## 配置

```yaml
# 是否启用获取小程序原链接
getMiniAppUrl: false
aliases:
  - 群聊助手
  - 群助手
```
