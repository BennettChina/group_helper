import { InputParameter } from "@modules/command";
import { GroupMessageEvent } from "icqq";
import { DB_KEY } from "#group_helper/util/constants";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	const { member: sender, group_id } = <GroupMessageEvent>messageData;
	if ( !sender.is_admin ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	await redis.delHash( DB_KEY.decrease_group_notice_key, group_id.toString( 10 ) );
	await sendMessage( '本群退群提醒已关闭。' );
}