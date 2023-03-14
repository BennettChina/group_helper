import { InputParameter } from "@modules/command";
import { GroupMessageEvent, Member } from "icqq";
import { isAt } from "#group_helper/util/tools";

function hasBanTime( message: string ): {
	day: number,
	hours: number,
	minutes: number
} {
	const res: RegExpExecArray | null = /.+]\s*((?<day>\d{1,2}d)?(?<hours>\d+h)?(?<minutes>\d+m?)?){1,3}/.exec( message );
	return {
		day: parseInt( res?.groups?.day || "0", 10 ),
		hours: parseInt( res?.groups?.hours || "0", 10 ),
		minutes: parseInt( res?.groups?.minutes || "0", 10 )
	}
}

// 最长禁言时间是29天23小时59分0秒
const MAX_BAN_TIME = ( 30 * 24 * 60 - 60 ) * 60;

export async function main( { sendMessage, messageData, client }: InputParameter ): Promise<void> {
	let content: string = messageData.raw_message;
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
	
	const atId: number = isAt( content );
	if ( !atId ) {
		await sendMessage( '未获取到AT用户的QQ号' );
		return;
	}
	
	const { day, hours, minutes } = hasBanTime( content );
	let banTime: number = ( day * 24 * 60 + hours * 60 + minutes ) * 60;
	if ( banTime === 0 ) {
		await sendMessage( '请设置至少1分钟的禁言时间' );
		return;
	}
	banTime = banTime > MAX_BAN_TIME ? MAX_BAN_TIME : banTime;
	
	const atIdMember: Member = client.pickMember( group_id, atId );
	if ( atIdMember.is_admin ) {
		await sendMessage( '群管理无法被禁言' );
		return;
	}
	
	// 禁言api时间单位:秒
	await atIdMember.mute( banTime );
}