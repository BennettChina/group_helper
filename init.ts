import { PluginSetting } from "@modules/plugin";
import { OrderConfig, SwitchConfig } from "@modules/command";
import * as msg from "@modules/message";
import { MessageScope, MessageType } from "@modules/message";
import { AuthLevel } from "@modules/management/auth";
import { groupIncrease } from "./achieves/welcome-enable";
import { BOT } from "@modules/bot";
import { GroupMessageEventData } from "oicq";
import { DB_KEY } from "#group_helper/util/constants";

const group_welcome: OrderConfig = {
	type: "order",
	cmdKey: "group-helper.welcome_new",
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
	cmdKey: "group-helper.welcome_enable",
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

const group_forbidden_word: SwitchConfig = {
	type: "switch",
	mode: "single",
	cmdKey: "group-helper.forbidden_word",
	desc: [ "设置屏蔽词", "#{OPT} [屏蔽词]" ],
	header: "banword",
	regexp: [ "#{OPT}", ".+" ],
	onKey: "add",
	offKey: "remove",
	scope: MessageScope.Both,
	auth: AuthLevel.Manager,
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
	auth: AuthLevel.Manager,
	main: "achieves/forbidden_word_list",
	detail: "该指令用于查看已设置的屏蔽词"
};

async function initWelcome( { redis, client }: BOT ) {
	let keys: string[] = await redis.getKeysByPrefix( `${ DB_KEY.welcome_content_key }.*` )
	for ( let key of keys ) {
		let groupId = key.split( '.' )[2]
		let {
			content,
			enable = "false"
		}: { content: string, enable: string } = await redis.getHash( `${ DB_KEY.welcome_content_key }.${ groupId }` );
		
		if ( enable === "true" && content ) {
			client.on( "notice.group.increase", groupIncrease( groupId ) );
		}
	}
}

async function listeningGroupMsg( { redis, client, logger, message, command, auth, config }: BOT ) {
	client.on( "message.group", async ( messageData: GroupMessageEventData ) => {
		let { raw_message, group_id, group_name, message_id, self_id } = messageData;
		const { user_id, nickname } = messageData.sender;
		
		// 判断消息是否指令消息，指令消息不需要判断是否有屏蔽词
		const atBOTReg: RegExp = new RegExp( `^ *\\[CQ:at,qq=${ config.number }.*?]` );
		if ( config.atBOT && atBOTReg.test( raw_message ) ) {
			raw_message = raw_message.replace( atBOTReg, "" ).trim();
		}
		const userAuth = await auth.get( user_id );
		const unionReg: RegExp = command.getUnion( userAuth, msg.MessageScope.Group );
		if ( unionReg.test( raw_message ) ) {
			return;
		}
		
		// 获取群成员信息
		const ret = await client.getGroupMemberInfo( group_id, user_id );
		const myRet = await client.getGroupMemberInfo( group_id, self_id );
		
		// 获取屏蔽词集合
		const forbidden_words: string[] = await redis.getSet( `${ DB_KEY.forbidden_words_key }.${ group_id }` );
		const global_forbidden_words: string[] = await redis.getSet( DB_KEY.forbidden_words_global_key );
		forbidden_words.push( ...global_forbidden_words );
		const list = Array.from( new Set( forbidden_words ) );
		
		// 判断消息中是否包含屏蔽词
		for ( let forbiddenWord of list ) {
			if ( raw_message.search( forbiddenWord ) !== -1 ) {
				const includes = global_forbidden_words.includes( forbiddenWord );
				logger.info( `--[group_helper]--[${ group_name }]--[${ nickname }]发言包含${ includes ? ' BOT 持有者' : '该群' }设置的屏蔽词[${ forbiddenWord }]，将尝试撤回 TA 的消息。` );
				if ( ret.retcode === 0 && myRet.retcode === 0 ) {
					if ( ret.data.role === 'owner' ) {
						logger.info( "--[group_helper]-- 该消息是群主发言，无法撤回。" );
					} else if ( myRet.data.role === 'member' ) {
						logger.info( "--[group_helper]-- BOT 无管理权限无法撤回。" );
					} else {
						await client.deleteMsg( message_id );
					}
				} else {
					logger.warn( "--[group_helper]-- 获取群成员信息失败，无法判断是否有权限撤回消息，将直接尝试撤回。" );
					await client.deleteMsg( message_id );
				}
				const sendMsg = await message.getSendMessageFunc( user_id, MessageType.Group, group_id );
				await sendMsg( `你的发言包含${ includes ? ' BOT 持有者' : '本群' }设置的屏蔽词[${ forbiddenWord }]，请注意发言!` );
				return;
			}
		}
	} );
}

// 不可 default 导出，函数名固定
export async function init( bot: BOT ): Promise<PluginSetting> {
	// 初始化已经启用欢迎词的群监听事件
	await initWelcome( bot );
	bot.logger.mark( "--[group_helper]--初始化欢迎词监听事件完成..." )
	
	// 监听群聊消息，处理包含屏蔽词的消息
	await listeningGroupMsg( bot );
	bot.logger.mark( "--[group_helper]--初始化屏蔽词监听事件完成..." )
	
	return {
		pluginName: "group_helper",
		cfgList: [ group_welcome, group_welcome_enable, group_forbidden_word, forbidden_word_list ]
	};
}