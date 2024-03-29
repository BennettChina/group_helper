import { defineDirective, SwitchMatchResult } from "@/modules/command";
import { checkAuth, htmlDecode } from "#/group_helper/util/tools";
import { isGroupMessage } from "@/modules/message";
import { DB_KEY } from "#/group_helper/util/constants";

export default defineDirective( "switch", async ( input ) => {
	const { sendMessage, messageData, redis, matchResult, logger } = input;
	const match = <SwitchMatchResult>matchResult;
	let [ forbidden_words ] = match.match;
	// 解码被处理过的正则字符串
	forbidden_words = htmlDecode( forbidden_words );
	// 检查权限，私聊设置全局屏蔽词需要master权限
	const check = await checkAuth( input, forbidden_words );
	if ( !check ) {
		return;
	}
	
	const forbidden_word_list = forbidden_words.split( "," );
	let dbKey = DB_KEY.forbidden_words_global_key;
	if ( isGroupMessage( messageData ) ) {
		dbKey = `${ DB_KEY.forbidden_words_key }.${ messageData.group_id }`;
	}
	if ( match.isOn ) {
		await redis.addSetMember( dbKey, ...forbidden_word_list );
		await sendMessage( `设置屏蔽词[${ forbidden_words }]成功！` );
		if ( isGroupMessage( messageData ) ) {
			logger.info( `[group_helper] [${ messageData.group_id }] [${ messageData.sender.nickname }]设置了该群的屏蔽词[${ forbidden_words }]` )
		} else {
			logger.info( `[group_helper] [${ messageData.sender.nickname }]设置了全局屏蔽词[${ forbidden_words }]` )
		}
	} else {
		const forbidden_word_list_db = await redis.getSet( dbKey );
		const remove_list: string[] = [];
		for ( let forbidden_word of forbidden_word_list ) {
			if ( forbidden_word_list_db.includes( forbidden_word ) ) {
				remove_list.push( forbidden_word );
			}
		}
		await redis.delSetMember( dbKey, ...remove_list );
		if ( remove_list.length === 0 ) {
			await sendMessage( '移除屏蔽词失败，您未设置此屏蔽词。' );
			if ( isGroupMessage( messageData ) ) {
				logger.info( `[group_helper] [${ messageData.group_id }] [${ messageData.sender.nickname }]未能成功移除屏蔽词[${ forbidden_words }]，原因是该群未设置此屏蔽词。` )
			} else {
				logger.info( `[group_helper] [${ messageData.sender.nickname }]未能移除全局屏蔽词[${ forbidden_words }]，原因是未设置此全局屏蔽词。` )
			}
		} else {
			await sendMessage( `移除屏蔽词[${ remove_list }]成功！` );
			if ( isGroupMessage( messageData ) ) {
				logger.info( `[group_helper] [${ messageData.group_id }] [${ messageData.sender.nickname }]移除了该群的屏蔽词[${ remove_list }]` )
			} else {
				logger.info( `[group_helper] [${ messageData.sender.nickname }]移除了全局屏蔽词[${ remove_list }]` );
			}
		}
	}
} )