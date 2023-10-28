import { defineDirective } from "@/modules/command";
import { isAt } from "#/group_helper/util/tools";
import { GroupMessageEvent } from "@/modules/lib";

export default defineDirective( "order", async ( { sendMessage, messageData, client } ) => {
	let content: string = messageData.raw_message;
	const { sender, group_id } = <GroupMessageEvent>messageData;
	if ( sender.role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令' );
		return;
	}
	
	const member = await client.getGroupMemberInfo( group_id, client.uin );
	if ( member.data.role === 'member' ) {
		await sendMessage( 'BOT 无群管理权限无法踢人' );
		return;
	}
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	await client.setGroupKick( group_id, atId );
} )