import { defineDirective } from "@/modules/command";
import { DB_KEY } from "#/group_helper/util/constants";
import { GroupMessageEvent } from "@/modules/lib";

export default defineDirective( "order", async ( { sendMessage, messageData, redis } ) => {
	const { sender, group_id } = <GroupMessageEvent>messageData;
	if ( sender.role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令' );
		return;
	}
	
	await redis.delHash( DB_KEY.decrease_group_notice_key, group_id.toString( 10 ) );
	await sendMessage( '本群退群提醒已关闭。' );
} )