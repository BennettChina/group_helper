import { definePlugin } from "@/modules/plugin";
import { isGroupMessage, Message, MessageScope, MessageType } from "@/modules/message";
import { BOT } from "@/modules/bot";
import { DB_KEY } from "#/group_helper/util/constants";
import GroupHelperConfig from "#/group_helper/module/config";
import type {
	GroupDecreaseNoticeEvent,
	GroupIncreaseNoticeEvent,
	GroupMessageEvent,
	JsonRecepElem,
	Sendable
} from "@/modules/lib";
import cfgList from "./commands";
import { ExportConfig } from "@/modules/config";
import bot from "ROOT";

let config: ExportConfig<GroupHelperConfig>;

export async function welcomeHandle( content: string, username: string, user_id: number, group_id: number ) {
	content = " " + content.replace( '{}', username );
	const sendMsg = bot.message.getSendMessageFunc( user_id, MessageType.Group, group_id );
	await sendMsg( content );
}

function groupIncrease( { redis, client }: BOT ) {
	return async ( event: GroupIncreaseNoticeEvent ) => {
		let keys: string[] = await redis.getKeysByPrefix( `${ DB_KEY.welcome_content_key }.*` )
		for ( let key of keys ) {
			let groupId = key.split( '.' )[2]
			let {
				content,
				enable = "false"
			} = await redis.getHash( `${ DB_KEY.welcome_content_key }.${ groupId }` );
			
			if ( enable === "true" && content ) {
				const member = await client.getGroupMemberInfo( event.group_id, event.user_id );
				welcomeHandle( content, member.data.nickname, event.user_id, event.group_id ).then();
			}
		}
	}
}

function listeningGroupMsg( { redis, client, logger, message, command, auth, config }: BOT ) {
	return async ( messageData: GroupMessageEvent ) => {
		const { group_id, message_id, atMe } = messageData;
		const { user_id, nickname } = messageData.sender;
		
		// 判断消息是否指令消息，指令消息不需要判断是否有屏蔽词
		let cqcode = messageData.raw_message;
		if ( config.base.atBOT && atMe ) {
			const atBotReg = new RegExp( `\\[CQ:at,qq=${client.uin}.*?]` );
			cqcode = cqcode.replace( atBotReg, "" ).trim();
		}
		
		// 去除回复消息的 cq 字符串
		const replyReg = new RegExp( `\\[CQ:reply,id=[\\w=+\-/]+]\\s*(\\[CQ:at,qq=\\d+]\\s*)*` );
		cqcode = cqcode.replace( replyReg, "" ).trim() || '';
		logger.debug( `>>去掉@消息的实际消息: ${ cqcode }` );
		
		try {
			const userAuth = await auth.get( user_id );
			const unionReg: RegExp = command.getUnion( userAuth, MessageScope.Group );
			if ( unionReg.test( cqcode ) ) {
				return;
			}
		} catch ( e ) {
			logger.warn( "指令检测失败", e );
			return;
		}
		
		const group = await client.getGroupInfo( group_id );
		// 获取群成员信息
		const sender = await client.getGroupMemberInfo( group_id, user_id );
		const self = await client.getGroupMemberInfo( group_id, client.uin );
		
		// 获取屏蔽词集合
		const forbidden_words: string[] = await redis.getSet( `${ DB_KEY.forbidden_words_key }.${ group_id }` );
		const global_forbidden_words: string[] = await redis.getSet( DB_KEY.forbidden_words_global_key );
		forbidden_words.push( ...global_forbidden_words );
		const list = Array.from( new Set( forbidden_words ) );
		
		// 判断消息中是否包含屏蔽词
		for ( let forbiddenWord of list ) {
			if ( cqcode.search( forbiddenWord ) !== -1 ) {
				const includes = global_forbidden_words.includes( forbiddenWord );
				logger.info( `[group_helper] [${ group.data.group_name }] [${ nickname }]发言包含${ includes ? ' BOT 持有者' : '该群' }设置的屏蔽词[${ forbiddenWord }]，将尝试撤回 TA 的消息。` );
				if ( sender.data.role === "owner" ) {
					logger.info( "[group_helper] 该消息是群主发言，无法撤回。" );
				} else if ( self.data.role === 'member' ) {
					logger.info( "[group_helper] BOT 无管理权限无法撤回。" );
				} else {
					await messageData.recall();
				}
				const sendMsg = message.getSendMessageFunc( user_id, MessageType.Group, group_id );
				await sendMsg( `你的发言包含${ includes ? ' BOT 持有者' : '本群' }设置的屏蔽词[${ forbiddenWord }]，请注意发言!` );
				return;
			}
		}
	}
}

function decreaseGroup( bot: BOT ) {
	return async ( {
		               group_id,
		               user_id,
		               operator_id,
		               sub_type
	               }: GroupDecreaseNoticeEvent ) => {
		const info = await bot.client.getGroupMemberInfo( group_id, user_id );
		const group = await bot.client.getGroupInfo( group_id );
		const username: string | undefined = info?.data?.nickname;
		const group_name: string | undefined = group.data.group_name;
		let message = '';
		if ( sub_type === 'leave' ) {
			message = `${ user_id }(${ username })自行退出了群组 ${ group_id }(${ group_name })`;
		} else {
			const operator = await bot.client.getGroupMemberInfo( group_id, operator_id );
			const operatorName: string | undefined = operator?.data?.nickname;
			message = `${ user_id }(${ username })被 ${ operator_id }(${ operatorName }) 踢出了群组 ${ group_id }(${ group_name })`;
		}
		bot.logger.info( message );
		const noticeMsg = await bot.redis.getHashField( DB_KEY.decrease_group_notice_key, `${ group_id }` );
		if ( noticeMsg ) {
			const sendMessage = bot.message.getSendMessageFunc( -1, MessageType.Group, group_id );
			await sendMessage( noticeMsg.replace( "{}", ( username || `${ user_id } ` ) ), false );
		}
	}
}

function allMessageEvent( { logger, client }: BOT ) {
	return async ( event: Message ) => {
		if ( !config.getMiniAppUrl ) {
			return;
		}
		
		const item = event.message.find( value => value.type === "json" ) as JsonRecepElem
		if ( !item ) {
			// 不是json消息不处理
			return
		}
		
		// 处理JSON的转发消息
		if ( !item.data?.data ) {
			return
		}
		
		const json: any = JSON.parse( item.data.data )
		if ( json['app'] === 'com.tencent.miniapp_01' ) {
			const from = json?.meta?.detail_1?.title;
			const title = json?.meta?.detail_1?.desc;
			const url = json?.meta?.detail_1?.qqdocurl;
			if ( !title || !url ) {
				logger.warn( `不支持的QQ小程序消息` );
				return;
			}
			
			function sendMsg( content: Sendable ) {
				isGroupMessage( event ) ? client.sendGroupMsg( event.group_id, content )
					: client.sendPrivateMsg( event.user_id, content );
			}
			
			sendMsg( `监测到来自[${ from }]的QQ小程序消息：${ title }` )
			sendMsg( `已自动为您提取原网页地址：${ url }` );
		}
	}
}

export default definePlugin( {
	name: "群助手",
	cfgList,
	repo: {
		owner: "BennettChina",
		repoName: "group_helper",
		ref: "main"
	},
	subscribe: [
		{
			name: "入群欢迎",
			getUser: async ( bot ) => {
				let keys: string[] = await bot.redis.getKeysByPrefix( `${ DB_KEY.welcome_content_key }.*` )
				return {
					group: keys.map( key => parseInt( key.split( '.' )[2] ) )
				}
			},
			reSub: async ( userId, type, bot ) => {
				if ( type === 'group' ) {
					await bot.redis.deleteKey( `${ DB_KEY.welcome_content_key }.${ userId }` );
				}
			}
		},
		{
			name: "群屏蔽词",
			getUser: async ( bot ) => {
				let keys: string[] = await bot.redis.getKeysByPrefix( `${ DB_KEY.forbidden_words_key }.*` )
				return {
					group: keys.map( key => parseInt( key.split( '.' )[2] ) )
				}
			},
			reSub: async ( userId, type, bot ) => {
				if ( type === 'group' ) {
					await bot.redis.deleteKey( `${ DB_KEY.forbidden_words_key }.${ userId }` );
				}
			}
		},
		{
			name: "退群监听",
			getUser: async ( bot ) => {
				let keys: string[] = await bot.redis.getKeysByPrefix( `${ DB_KEY.decrease_group_notice_key }.*` )
				return {
					group: keys.map( key => parseInt( key.split( '.' )[2] ) )
				}
			},
			reSub: async ( userId, type, bot ) => {
				if ( type === 'group' ) {
					if ( bot.logger.isInfoEnabled() ) {
						const group = await bot.client.getGroupInfo( userId );
						bot.logger.info( `BOT 已退出群聊 ${ userId }(${ group.data.group_name })， 已为您移除该群的订阅。` );
					}
					await bot.redis.delHash( DB_KEY.decrease_group_notice_key, `${ userId }` );
				}
			}
		}
	],
	async mounted( params ) {
		config = params.configRegister( GroupHelperConfig.FILE_NAME, GroupHelperConfig.init );
		params.setAlias( config.aliases );
		config.on( "refresh", ( newCfg ) => {
			params.setAlias( newCfg.aliases );
		} )
		// 初始化已经启用欢迎词的群监听事件
		params.client.on( "notice.group.member_increase", groupIncrease( params ) );
		params.logger.info( "[group_helper] - 入群欢迎监听事件已启动完成!" );
		
		// 监听群聊消息，处理包含屏蔽词的消息
		params.client.on( "message.group", listeningGroupMsg( params ) );
		params.logger.info( "[group_helper] - 屏蔽词监听事件已启动完成!" );
		
		// 监听群聊退出事件
		params.client.on( "notice.group.member_decrease", decreaseGroup( params ) );
		params.logger.info( "[group_helper] - 群聊退出事件监听已启动成功!" );
		
		// 监听所有消息处理小程序信息
		params.client.on( "message", allMessageEvent( params ) );
		params.logger.info( "[group_helper] - 所有消息事件监听已启动成功!" );
	},
	async unmounted( params ) {
		// 把事件监听去掉
		params.client.off( "message", allMessageEvent( params ) );
		params.client.off( "message.group", listeningGroupMsg( params ) );
		params.client.on( "notice.group.member_decrease", decreaseGroup( params ) );
		params.client.on( "notice.group.member_increase", groupIncrease( params ) );
	}
} )