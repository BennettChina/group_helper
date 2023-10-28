import { defineDirective, SwitchMatchResult } from "@/modules/command";
import { DB_KEY } from "#/group_helper/util/constants";
import { GroupMessageEvent } from "@/modules/lib";

export default defineDirective( "switch", async ( { sendMessage, matchResult, messageData, redis } ) => {
	const match = <SwitchMatchResult>matchResult;
	const { sender, group_id } = <GroupMessageEvent>messageData;
	if ( sender.role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	let {
		content,
		enable = "false"
	} = await redis.getHash( `${ DB_KEY.welcome_content_key }.${ group_id }` );
	
	if ( match.isOn ) {
		if ( !content ) {
			await sendMessage( '请先设置入群欢迎词' );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { enable: "true" } );
	} else {
		if ( !content && enable === "false" ) {
			await sendMessage( `本群未启用欢迎词` );
			return;
		}
		
		await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { enable: "false" } );
	}
	await sendMessage( `本群的新群员入群欢迎词已${ match.isOn ? '启用' : '禁用' }！` );
} )