import { InputParameter } from "@modules/command";
import { GroupMessageEventData, MemberInfo, Ret } from "oicq";
import { isAt } from "#group_helper/util/tools";

export async function main( { sendMessage, messageData, client }: InputParameter ): Promise<void> {
	let content: string = messageData.raw_message;
	const { sender: { role }, group_id, self_id } = <GroupMessageEventData>messageData;
	if ( role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	const ret: Ret<MemberInfo> = await client.getGroupMemberInfo( group_id, self_id );
	if ( ret.data?.role === 'member' ) {
		await sendMessage( 'BOT 无群管理权限无法踢人' );
		return;
	}
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	await client.setGroupKick( group_id, atId );
}