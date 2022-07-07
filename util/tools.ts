import { isPrivateMessage } from "@modules/message";
import { AuthLevel } from "@modules/management/auth";
import { GroupMessageEventData } from "oicq";
import { InputParameter } from "@modules/command";

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
		
		const { sender: { role } } = <GroupMessageEventData>messageData;
		if ( role === 'member' ) {
			await sendMessage( '您不是本群管理不能使用该指令', true );
			return false;
		}
		return true;
	}