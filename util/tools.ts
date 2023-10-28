import { isPrivateMessage } from "@/modules/message";
import { AuthLevel } from "@/modules/management/auth";
import { InputParameter } from "@/modules/command";
import { GroupMessageEvent } from "@/modules/lib";

export const checkAuth: ( input: InputParameter, forbidden_words: string ) => Promise<boolean> =
	async ( { messageData, auth, sendMessage, logger }, forbidden_words ) => {
		if ( isPrivateMessage( messageData ) && messageData.sub_type === 'friend' ) {
			const r = await auth.check( messageData.user_id, AuthLevel.Master );
			if ( !r ) {
				await sendMessage( '您的权限不能在私聊中使用该指令' );
				logger.info( `[${ messageData.user_id }]尝试在私聊中设置全局屏蔽词[${ forbidden_words }]，权限不足未能设置。` );
				return false;
			}
			return true;
		}
		
		const { sender } = <GroupMessageEvent>messageData;
		if ( sender.role === 'member' ) {
			await sendMessage( '您不是本群管理不能使用该指令', true );
			return false;
		}
		return true;
	}

/**
 * 将QQ处理过的字符串解码
 * @param str html encode string
 */
export function htmlDecode( str: string ): string {
	return str.replace( /&#(\d+);/gi, function ( match, numStr ) {
		const num = parseInt( numStr, 10 );
		return String.fromCharCode( num );
	} );
}

export function isAt( message: string ): number {
	const res: RegExpExecArray | null = /\[cq:at,qq=(?<id>\d+),text=.*]/.exec( message );
	return parseInt( res?.groups?.id || "", 10 );
}