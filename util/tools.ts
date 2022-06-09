import { isPrivateMessage, Message } from "@modules/message";
import Authorization, { AuthLevel } from "@modules/management/auth";

export const checkAuth: ( messageData: Message, auth: Authorization ) => Promise<boolean> = async ( messageData, auth ) => {
	if ( isPrivateMessage( messageData ) && messageData.sub_type === 'friend' ) {
		return await auth.check( messageData.user_id, AuthLevel.Master );
	}
	return true;
}