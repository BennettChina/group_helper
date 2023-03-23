import { PluginSetting } from "@modules/plugin";
import { OrderConfig, SwitchConfig } from "@modules/command";
import * as msg from "@modules/message";
import { MessageScope, MessageType } from "@modules/message";
import { AuthLevel } from "@modules/management/auth";
import { groupIncrease } from "./achieves/welcome-enable";
import { BOT } from "@modules/bot";
import { GroupMessageEvent, Member, MemberDecreaseEvent } from "icqq";
import { DB_KEY } from "#group_helper/util/constants";

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
	regexp: [ "#{OPT}" ],
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
	regexp: [ "#{OPT}", ".+" ],
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
	regexps: [ "\\[CQ:at,type=at,qq=\\d+.*]", "((\\d{1,2}d)?(\\d+h)?(\\d+m?)?){1,3}" ],
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
	regexps: [ "\\[CQ:at,type=at,qq=\\d+.*]" ],
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
	regexp: [ "#{OPT}" ],
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
	regexps: [ "\\[CQ:at,type=at,qq=\\d+.*]" ],
	scope: MessageScope.Group,
	auth: AuthLevel.User,
	main: "achieves/remove_group_user",
	detail: "通过该指令将某用户踢出群聊。"
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
			client.on( "notice.group.increase", groupIncrease( parseInt( groupId ) ) );
		}
	}
}

function listeningGroupMsg( { redis, client, logger, message, command, auth, config }: BOT ): void {
	client.on( "message.group", async ( messageData: GroupMessageEvent ) => {
		const { group_id, group_name, message_id, atme } = messageData;
		const { user_id, nickname } = messageData.sender;
		
		// 判断消息是否指令消息，指令消息不需要判断是否有屏蔽词
		let cqcode = messageData.toCqcode();
		if ( config.atBOT && atme ) {
			const atBotReg = new RegExp( `\\[CQ:at,type=at,qq=${config.number}.*?]` );
			cqcode = cqcode.replace( atBotReg, "" ).trim();
		}
		
		// 去除回复消息的 cq 字符串
		const replyReg = new RegExp( `\\[CQ:reply,id=[\\w=+/]+]\\s*(\\[CQ:at,type=at,qq=\\d+,text=.*])?` );
		cqcode = cqcode.replace( replyReg, "" ).trim() || '';
		logger.debug( `>>去掉@消息的实际消息: ${ cqcode }` );
		
		try {
			const userAuth = await auth.get( user_id );
			const unionReg: RegExp = command.getUnion( userAuth, msg.MessageScope.Group );
			if ( unionReg.test( cqcode ) ) {
				return;
			}
		} catch ( e ) {
			logger.warn( "指令检测失败", e );
			return;
		}
		
		// 获取群成员信息
		const sender = client.pickMember( group_id, user_id );
		const self = client.pickMember( group_id, config.number );
		
		// 获取屏蔽词集合
		const forbidden_words: string[] = await redis.getSet( `${ DB_KEY.forbidden_words_key }.${ group_id }` );
		const global_forbidden_words: string[] = await redis.getSet( DB_KEY.forbidden_words_global_key );
		forbidden_words.push( ...global_forbidden_words );
		const list = Array.from( new Set( forbidden_words ) );
		
		// 判断消息中是否包含屏蔽词
		for ( let forbiddenWord of list ) {
			if ( cqcode.search( forbiddenWord ) !== -1 ) {
				const includes = global_forbidden_words.includes( forbiddenWord );
				logger.info( `[group_helper] [${ group_name }] [${ nickname }]发言包含${ includes ? ' BOT 持有者' : '该群' }设置的屏蔽词[${ forbiddenWord }]，将尝试撤回 TA 的消息。` );
				if ( sender.is_owner ) {
					logger.info( "[group_helper] 该消息是群主发言，无法撤回。" );
				} else if ( !self.is_admin ) {
					logger.info( "[group_helper] BOT 无管理权限无法撤回。" );
				} else {
					await client.deleteMsg( message_id );
				}
				const sendMsg = message.getSendMessageFunc( user_id, MessageType.Group, group_id );
				await sendMsg( `你的发言包含${ includes ? ' BOT 持有者' : '本群' }设置的屏蔽词[${ forbiddenWord }]，请注意发言!` );
				return;
			}
		}
	} );
}

function decreaseGroup( bot: BOT ): void {
	bot.client.on( "notice.group.decrease", async ( {
		                                                group,
		                                                group_id,
		                                                user_id,
		                                                dismiss,
		                                                operator_id,
		                                                member
	                                                }: MemberDecreaseEvent ) => {
		const { info }: Member = await group.pickMember( operator_id );
		const nickname: string | undefined = info?.nickname;
		const group_name: string | undefined = group.name;
		bot.logger.info( `${ user_id === bot.config.number ? `${ bot.client.nickname } (BOT) ` : `${ user_id }(${ member?.nickname })` } ${ dismiss ? `解散了群聊(${ group.name || group_name }).` : `退出了群聊 ${ group_id }(${ group?.name || group_name })，退群原因是：${ operator_id === user_id ? "自行退群" : `被 ${ operator_id }(${ nickname }) 踢出群聊` }.` }` );
		// 如果退出群聊的是 BOT 或者群聊被解散那么就把该群聊的新成员入群监听和屏蔽词去掉
		if ( user_id === bot.config.number || dismiss ) {
			await bot.redis.deleteKey( `${ DB_KEY.welcome_content_key }.${ group_id }` );
			await bot.redis.deleteKey( `${ DB_KEY.forbidden_words_key }.${ group_id }` );
			await bot.redis.delHash( DB_KEY.decrease_group_notice_key, `${ group_id }` );
			return;
		}
		
		const noticeMsg = await bot.redis.getHashField( DB_KEY.decrease_group_notice_key, `${ group_id }` );
		if ( noticeMsg ) {
			const sendMessage = bot.message.getSendMessageFunc( -1, MessageType.Group, group_id );
			await sendMessage( noticeMsg.replace( "{}", ( member?.nickname || `${ user_id } ` ) ), false );
		}
	} );
}

// 不可 default 导出，函数名固定
export async function init( bot: BOT ): Promise<PluginSetting> {
	// 初始化已经启用欢迎词的群监听事件
	await initWelcome( bot );
	bot.logger.info( "[group_helper] - 初始化欢迎词监听事件完成..." );
	
	// 监听群聊消息，处理包含屏蔽词的消息
	listeningGroupMsg( bot );
	bot.logger.info( "[group_helper] - 初始化屏蔽词监听事件完成..." );
	
	// 监听群聊退出事件
	decreaseGroup( bot );
	bot.logger.info( "[group_helper] - 群聊退出事件监听已启动成功!" );
	
	return {
		pluginName: "group_helper",
		aliases: [ "群聊助手", "群助手" ],
		cfgList: [ group_welcome, group_welcome_enable, group_forbidden_word, forbidden_word_list, ban_user, decrease_group_notice
			, unban_user, decrease_group_notice_cancel, remove_group_user, ban_all ],
		repo: {
			owner: "BennettChina",
			repoName: "group_helper",
			ref: "main"
		}
	};
}