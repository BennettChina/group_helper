import { InputParameter } from "@modules/command";
import { GroupMessageEvent, Member } from "icqq";
import { isAt } from "#group_helper/util/tools";

export async function main( { sendMessage, client, messageData }: InputParameter ): Promise<void> {
	let content: string = messageData.raw_message;
	const { member: sender, group_id } = <GroupMessageEvent>messageData;
	if ( !sender.is_admin ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	const member: Member = client.pickMember( group_id, client.uin );
	if ( !member.is_admin ) {
		await sendMessage( 'BOT 无群管理权限无法解除禁言' );
		return;
	}
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	const atIdMember: Member = client.pickMember( group_id, atId );
	if ( atIdMember.is_admin ) {
		await sendMessage( '群管理无法被禁言，所以不需要解除禁言' );
		return;
	}
	
	await atIdMember.mute( 0 );
}