import { defineDirective, SwitchMatchResult } from "@/modules/command";
import { GroupMessageEvent } from "@/modules/lib";

export default defineDirective( "switch", async ( { sendMessage, messageData, matchResult, client } ) => {
	const { sender, group_id } = <GroupMessageEvent>messageData;
	if ( sender.role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令' );
		return;
	}
	
	const member = await client.getGroupMemberInfo( group_id, client.uin );
	if ( member.data.role === 'member' ) {
		await sendMessage( 'BOT 无群管理权限无法禁言用户' );
		return;
	}
	
	const match = <SwitchMatchResult>matchResult;
	await client.setGroupWholeBan( group_id, match.isOn );
} )