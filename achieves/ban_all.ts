import { InputParameter, SwitchMatchResult } from "@modules/command";
import { GroupMessageEvent, Member } from "icqq";

export async function main( { sendMessage, messageData, matchResult, client }: InputParameter ): Promise<void> {
	const { member: sender, group_id } = <GroupMessageEvent>messageData;
	if ( !sender.is_admin ) {
		await sendMessage( '您不是本群管理不能使用该指令' );
		return;
	}
	
	const member: Member = client.pickMember( group_id, client.uin );
	if ( !member.is_admin ) {
		await sendMessage( 'BOT 无群管理权限无法禁言用户' );
		return;
	}
	
	const match = <SwitchMatchResult>matchResult;
	await client.pickGroup( group_id ).muteAll( match.isOn() );
}