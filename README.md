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
命令: <header> sw <QQ群号> <欢迎词>
范围: 私聊
权限: BOT管理员 (Manager)

# 启用或禁用欢迎词
命令: <header> we <enable|disable> <QQ群号>
范围: 私聊
权限: BOT管理 (Manager)

# 添加或移除屏蔽词（多个屏蔽词以英文逗号隔开，屏蔽词支持正则）
命令: <header> banword <add|remove> <屏蔽词>
范围: 私聊/群聊(私聊仅Master可用，用来设置全局屏蔽词)
权限: BOT管理 (Manager)

# 查看已设置的屏蔽词
命令: <header> fwl
范围: 私聊/群聊(私聊仅Master可用，用来查看已设置的全局屏蔽词)
权限: BOT管理 (Manager)
```

## 更新日志

- 2022/06/23 fixed: 修复使用AT指令时会将消息全部替换为空导致继续匹配屏蔽词的问题
- 2022/06/09 添加 `#banword` 和 `#fwl` 指令来管理群聊屏蔽词。

<details>
    <summary style="padding-left: 15px;">2022/04/13 规范 <code>cmdKey</code> </summary>

本次更新为了规范 `cmdKey` 更改了 `cmdKey`的前缀，因此如果你修改过插件的 `header` 那么需要手动替换下新的 `cmdKey` 的前缀，`Linux` 可使用下面的命令修改， `Windows`
请自行修改 `silvery-star.welcome_new` 为 `group-helper.welcome_new` 和 `silvery-star.welcome_enable`
为 `group-helper.welcome_enable` 。

Linux

```shell
sed -i 's/silvery-star.welcome_/group-helper.welcome_/' config/commands.yml
```

macOS

```shell
sed -i '' 's/silvery-star.welcome_/group-helper.welcome_/' config/commands.yml
```

</details>