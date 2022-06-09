import { InputParameter, SwitchMatchResult } from "@modules/command";
import * as sdk from "oicq";
import { MessageType } from "@modules/message";
import bot from 'ROOT';
import { DB_KEY } from "#group_helper/util/constants";

export async function main( { sendMessage, matchResult, client, redis }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const [ groupId ] = match.match;
	let {
		content,
		enable = "false"
	}: { content: string, enable: string } = await redis.getHash( `${ DB_KEY.welcome_content_key }.${ groupId }` );
	
	if ( match.isOn() ) {
		if ( !content ) {
			await sendMessage( '请先设置入群欢迎词' );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ groupId }`, { enable: "true" } );
		client.on( "notice.group.increase", groupIncrease( groupId ) );
	} else {
		if ( !content && enable === "false" ) {
			await sendMessage( `[${ groupId }]未启用欢迎词` );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ groupId }`, { enable: "false" } );
	}
	await sendMessage( `[${ groupId }]的新群员入群欢迎词已${ match.isOn() ? '启用' : '禁用' }！` );
}


export function groupIncrease( groupId: string ) {
	return async function ( eventData: sdk.MemberIncreaseEventData ) {
		if ( eventData.group_id === parseInt( groupId ) ) {
			let {
				content,
				enable = "false"
			}: { content: string, enable: string } = await bot.redis.getHash( `${ DB_KEY.welcome_content_key }.${ groupId }` );
			if ( enable === "true" ) {
				content = " " + content.replace( '{}', eventData.nickname )
				const sendMsg = bot.message.getSendMessageFunc( eventData.user_id, MessageType.Group, eventData.group_id );
				await sendMsg( content, true );
			}
		}
	}
}