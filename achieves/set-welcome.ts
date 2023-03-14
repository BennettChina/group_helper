import { InputParameter } from "@modules/command";
import { DB_KEY } from "#group_helper/util/constants";
import { GroupMessageEvent } from "icqq";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	let content = messageData.raw_message;
	const { member: sender, group_id } = <GroupMessageEvent>messageData;
	if ( !sender.is_admin ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { content } );
	await sendMessage( '新群员入群欢迎词已设置成功！' );
}