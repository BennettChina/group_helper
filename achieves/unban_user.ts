import { InputParameter } from "@modules/command";
import { GroupMessageEventData, MemberInfo, Ret } from "oicq";
import { isAt } from "#group_helper/util/tools";

export async function main( { sendMessage, client, messageData }: InputParameter ): Promise<void> {
	let content: string = messageData.raw_message;
	const { sender: { role }, group_id, self_id } = <GroupMessageEventData>messageData;
	if ( role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	const ret: Ret<MemberInfo> = await client.getGroupMemberInfo( group_id, self_id );
	if ( ret.data?.role === 'member' ) {
		await sendMessage( 'BOT 无群管理权限无法解除禁言' );
		return;
	}
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	const atIdRet: Ret<MemberInfo> = await client.getGroupMemberInfo( group_id, atId );
	if ( atIdRet.data?.role !== 'member' ) {
		await sendMessage( '群管理无法被禁言，所以不需要解除禁言' );
		return;
	}
	
	await client.setGroupBan( group_id, atId, 0 );
}