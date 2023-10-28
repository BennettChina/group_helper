import { ConfigType, OrderConfig, SwitchConfig } from "@/modules/command";
import { MessageScope } from "@/modules/message";
import { AuthLevel } from "@/modules/management/auth";

const group_welcome: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.welcome_new",
	desc: [ "欢迎新成员", "[群号] [任意内容]" ],
	headers: [ "sw" ],
	regexps: [ ".+" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/set-welcome",
	detail: "该指令用于设置欢迎新成员的欢迎词"
};

const group_welcome_enable: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "group-helper.welcome_enable",
	desc: [ "开关欢迎词", "#{OPT}" ],
	header: "we",
	regexps: [ "#{OPT}" ],
	onKey: "enable",
	offKey: "disable",
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/welcome-enable",
	detail: "该指令用于启用或禁用欢迎词"
};

const group_forbidden_word: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "group-helper.forbidden_word",
	desc: [ "设置屏蔽词", "#{OPT} [屏蔽词]" ],
	header: "banword",
	regexps: [ "#{OPT}", ".+" ],
	onKey: "add",
	offKey: "remove",
	scope: MessageScope.Both,
	auth: AuthLevel.User,
	main: "achieves/forbidden_word",
	detail: "该指令用于添加或者移除屏蔽词，多个屏蔽词可用英文逗号隔开。（屏蔽词支持正则）"
};

const forbidden_word_list: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.forbidden_word_list",
	desc: [ "屏蔽词列表", "" ],
	headers: [ "fwl" ],
	regexps: [ "" ],
	scope: MessageScope.Both,
	auth: AuthLevel.User,
	main: "achieves/forbidden_word_list",
	detail: "该指令用于查看已设置的屏蔽词"
};

const ban_user: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.ban_user",
	desc: [ "禁言", "[@] [禁言时间]" ],
	headers: [ "bu" ],
	regexps: [ "\\[CQ:at,qq=\\d+.*]", "((\\d{1,2}d)?(\\d+h)?(\\d+m?)?){1,3}" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/ban_user",
	detail: "该指令用于给群用户设置禁言时间，可以是1d1h10m，即禁言1天1小时10分钟，可以如果某个是0可以略过，如：1d10m，不写时间单位默认是分钟。"
};

const unban_user: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.unban_user",
	desc: [ "取消禁言", "[@]" ],
	headers: [ "ubu" ],
	regexps: [ "\\[CQ:at,qq=\\d+.*]" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/unban_user",
	detail: "该指令用于给群用户取消禁言。"
};

const ban_all: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "group-helper.ban_all",
	desc: [ "全员禁言", "#{OPT}" ],
	header: "全员禁言",
	regexps: [ "#{OPT}" ],
	onKey: "开启",
	offKey: "关闭",
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/ban_all",
	detail: "该指令用于开启或者关闭全员禁言。"
};

const decrease_group_notice: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.decrease_group_notice",
	desc: [ "设置退群提醒", "消息模版" ],
	headers: [ "dgn" ],
	regexps: [ ".+" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/decrease_group_notice",
	detail: "通过该指令设置退群消息模版，{}用来替换成退群用户名或用户QQ号，为了隐私性也可以不设置{}。"
};

const decrease_group_notice_cancel: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.decrease_group_notice_cancel",
	desc: [ "取消退群提醒", "" ],
	headers: [ "dgnc" ],
	regexps: [ "" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/decrease_group_notice_cancel",
	detail: "通过该指令取消退群提醒。"
};

const remove_group_user: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.remove_group_user",
	desc: [ "踢人出群", "[@]" ],
	headers: [ "rgu" ],
	regexps: [ "\\[CQ:at,qq=\\d+.*]" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/remove_group_user",
	detail: "通过该指令将某用户踢出群聊。"
};

export default <ConfigType[]>[
	group_welcome, group_welcome_enable, group_forbidden_word
	, forbidden_word_list, ban_user, decrease_group_notice
	, unban_user, decrease_group_notice_cancel, remove_group_user, ban_all
]