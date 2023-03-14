import { InputParameter } from "@modules/command";
import { GroupMessageEvent, Member } from "icqq";
import { isAt } from "#group_helper/util/tools";

export async function main( { sendMessage, messageData, client }: InputParameter ): Promise<void> {
	let content: string = messageData.raw_message;
	const { member: sender, group_id } = <GroupMessageEvent>messageData;
	if ( !sender.is_admin ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	const member: Member = client.pickMember( group_id, client.uin );
	if ( !member.is_admin ) {
		await sendMessage( 'BOT 无群管理权限无法踢人' );
		return;
	}
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	await client.pickGroup( group_id ).kickMember( atId );
}