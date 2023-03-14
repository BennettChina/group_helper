import { InputParameter } from "@modules/command";
import { isGroupMessage } from "@modules/message";
import { DB_KEY } from "#group_helper/util/constants";
import { AuthLevel } from "@modules/management/auth";

export async function main( {
	                            sendMessage,
	                            messageData,
	                            redis,
	                            auth
                            }: InputParameter ): Promise<void> {
	if ( isGroupMessage( messageData ) ) {
		const forbidden_words: string[] = await redis.getSet( `${ DB_KEY.forbidden_words_key }.${ messageData.group_id }` );
		if ( forbidden_words.length === 0 ) {
			await sendMessage( '本群未设置屏蔽词' );
			return;
		}
		const msg = forbidden_words.join( '\n- ' );
		await sendMessage( `已设置的屏蔽词：\n- ${ msg }` );
	} else {
		const check = await auth.check( messageData.sender.user_id, AuthLevel.Master );
		if ( check ) {
			const global_forbidden_words: string[] = await redis.getSet( DB_KEY.forbidden_words_global_key );
			if ( global_forbidden_words.length === 0 ) {
				await sendMessage( '您未设置全局屏蔽词' );
				return;
			}
			const msg = global_forbidden_words.join( '\n- ' );
			await sendMessage( `已设置的屏蔽词：\n- ${ msg }` );
		} else {
			await sendMessage( '您无法查看 BOT 持有者设置的屏蔽词。' );
		}
	}
}