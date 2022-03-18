import { InputParameter, SwitchMatchResult } from "@modules/command";
import * as sdk from "oicq";
import { MessageType } from "@modules/message";
import bot from 'ROOT';

export async function main( { sendMessage, matchResult, client, redis }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const [ groupId ] = match.match;
	let {
		content,
		enable = false
	}: { content: string, enable: boolean } = await redis.getHash( `group-helper.welcome-content.${ groupId }` );
	
	if ( match.isOn() ) {
		if ( !content ) {
			await sendMessage( '请先设置入群欢迎词' );
			return;
		}
		
		await redis.setHash( `group-helper.welcome-content.${ groupId }`, { enable: true } );
		client.on( "notice.group.increase", groupIncrease( groupId, content ) );
	} else {
		if ( !content && !enable ) {
			await sendMessage( `[${ groupId }]未启用欢迎词` );
			return;
		}
		
		await redis.setHash( `group-helper.welcome-content.${ groupId }`, { enable: false } );
	}
	await sendMessage( `[${ groupId }]的新群员入群欢迎词已${ match.isOn() ? '启用' : '禁用' }！` );
}


export function groupIncrease( groupId: string, content: string ) {
	return async function ( eventData: sdk.MemberIncreaseEventData ) {
		if ( eventData.group_id === parseInt( groupId ) ) {
			let {
				enable = false
			}: { enable: boolean } = await bot.redis.getHash( `group-helper.welcome-content.${ groupId }` );
			if ( enable ) {
				content = " " + content.replace( '{}', eventData.nickname )
				const sendMsg = bot.message.getSendMessageFunc( eventData.user_id, MessageType.Group, eventData.group_id );
				await sendMsg( content, true );
			}
		}
	}
}