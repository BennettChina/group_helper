本项目为 [Adachi-BOT](https://github.com/SilveryStar/Adachi-BOT) 衍生插件，用于设置QQ群的入群欢迎词。

## 更新须知

本次更新为了规范 `cmdKey` 更改了 `cmdKey`的前缀，因此如果你修改过插件的 `header` 那么需要手动替换下新的 `cmdKey` 的前缀，`Linux` 可使用下面的命令修改， `Windows` 请自行修改 `silvery-star.welcome_new` 为 `group-helper.welcome_new` 和 `silvery-star.welcome_enable` 为 `group-helper.welcome_enable` 。

Linux

```shell
sed -i 's/silvery-star.welcome_/group-helper.welcome_/' config/commands.yml
```

macOS

```shell
sed -i '' 's/silvery-star.welcome_/group-helper.welcome_/' config/commands.yml
```

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

>感谢[GitClone](https://gitclone.com/) 和 [GitHub Proxy](https://ghproxy.com/) 提供的镜像服务！

## 使用方法

欢迎词格式比如: `#sw 12345678 欢迎{}加入本群🎉`，  `{}`将会被替换成新群员的昵称。

```
# 设置欢迎词
命令: <header> sw <QQ群号> <欢迎词>
范围: 私聊
权限: BOT管理员 (Manager)

#启用或禁用欢迎词
命令: <header> we <enable|disable> <QQ群号>
范围: 私聊
权限: BOT管理 (Manager)
```
