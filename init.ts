import { PluginSetting } from "@modules/plugin";
import { OrderConfig, SwitchConfig } from "@modules/command";
import { MessageScope } from "@modules/message";
import { AuthLevel } from "@modules/management/auth";
import bot from 'ROOT';
import { groupIncrease } from "./achieves/welcome-enable";

const group_welcome: OrderConfig = {
	type: "order",
	cmdKey: "silvery-star.welcome_new",
	desc: [ "欢迎新成员", "[群号] [任意内容]" ],
	headers: [ "sw" ],
	regexps: [ "\\d+", ".+" ],
	scope: MessageScope.Private,
	auth: AuthLevel.Manager,
	main: "achieves/set-welcome",
	detail: "该指令用于设置欢迎新成员的欢迎词"
};

const group_welcome_enable: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "silvery-star.welcome_enable",
	desc: [ "开关欢迎词", "#{OPT} [群号]" ],
	header: "we",
	regexp: [ "#{OPT}", "\\d+" ],
	onKey: "enable",
	offKey: "disable",
	scope: MessageScope.Private,
	auth: AuthLevel.Manager,
	main: "achieves/welcome-enable",
	detail: "该指令用于启用或禁用欢迎词"
};

// 不可 default 导出，函数名固定
export async function init(): Promise<PluginSetting> {
	// 初始化已经启用欢迎词的群监听事件
	let keys: string[] = await bot.redis.getKeysByPrefix( 'group-helper.welcome-content.*' )
	for ( let key of keys ) {
		let groupId = key.split( '.' )[2]
		let {
			content,
			enable = false
		}: { content: string, enable: boolean } = await bot.redis.getHash( `group-helper.welcome-content.${ groupId }` );
		if ( enable && content ) {
			bot.client.on( "notice.group.increase", groupIncrease( groupId, content ) );
		}
	}
	
	return {
		pluginName: "group_helper",
		cfgList: [ group_welcome, group_welcome_enable ]
	};
}