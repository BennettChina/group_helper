import { defineDirective } from "@/modules/command";
import { DB_KEY } from "#/group_helper/util/constants";
import { GroupMessageEvent } from "@/modules/lib";

export default defineDirective( "order", async ( { sendMessage, messageData, redis } ) => {
	let content = messageData.raw_message;
	const { sender, group_id } = <GroupMessageEvent>messageData;
	if ( sender.role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令' );
		return;
	}
	
	await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { content } );
	await sendMessage( '新群员入群欢迎词已设置成功！' );
} )