import { InputParameter, SwitchMatchResult } from "@modules/command";
import * as sdk from "oicq";
import { GroupMessageEventData } from "oicq";
import { MessageType } from "@modules/message";
import bot from 'ROOT';
import { DB_KEY } from "#group_helper/util/constants";

export async function main( { sendMessage, matchResult, messageData, client, redis }: InputParameter ): Promise<void> {
	const match = <SwitchMatchResult>matchResult;
	const { sender: { role }, group_id } = <GroupMessageEventData>messageData;
	if ( role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	let {
		content,
		enable = "false"
	}: { content: string, enable: string } = await redis.getHash( `${ DB_KEY.welcome_content_key }.${ group_id }` );
	
	if ( match.isOn() ) {
		if ( !content ) {
			await sendMessage( '请先设置入群欢迎词' );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { enable: "true" } );
		client.on( "notice.group.increase", groupIncrease( group_id ) );
	} else {
		if ( !content && enable === "false" ) {
			await sendMessage( `本群未启用欢迎词` );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { enable: "false" } );
	}
	await sendMessage( `本群的新群员入群欢迎词已${ match.isOn() ? '启用' : '禁用' }！` );
}


export function groupIncrease( groupId: number ) {
	return async function ( eventData: sdk.MemberIncreaseEventData ) {
		if ( eventData.group_id === groupId ) {
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