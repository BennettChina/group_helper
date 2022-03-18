import { InputParameter } from "@modules/command";

export async function main( { sendMessage, messageData, redis, client, config }: InputParameter ): Promise<void> {
	let data = messageData.raw_message;
	let [ groupId, content ] = data.split( ' ' );
	
	// 检查bot是否在用户设置到群里
	let res = await client.getGroupMemberInfo( parseInt( groupId ), config.number );
	if ( res.retcode !== 0 ) {
		await sendMessage( 'BOT未加入该群，请核实群号！' );
		return;
	}
	
	await redis.setHash( `group-helper.welcome-content.${ groupId }`, { content } );
	await sendMessage( '新群员入群欢迎词已设置成功！' );
}