import { InputParameter } from "@modules/command";
import { DB_KEY } from "#group_helper/util/constants";
import { GroupMessageEventData } from "oicq";

export async function main( { sendMessage, messageData, redis }: InputParameter ): Promise<void> {
	let content = messageData.raw_message;
	const { sender: { role }, group_id } = <GroupMessageEventData>messageData;
	if ( role === 'member' ) {
		await sendMessage( '您不是本群管理不能使用该指令', true );
		return;
	}
	
	await redis.setHash( `${ DB_KEY.welcome_content_key }.${ group_id }`, { content } );
	await sendMessage( '新群员入群欢迎词已设置成功！' );
}