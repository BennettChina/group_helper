export interface IGroupHelperConfig {
	tips: string;
	getMiniAppUrl: boolean;
	aliases: string[];
}

export default class GroupHelperConfig implements IGroupHelperConfig {
	public static readonly FILE_NAME: string = "group_helper";
	public static init: IGroupHelperConfig = {
		tips: "getMiniAppUrl是否启用获取小程序原链接",
		getMiniAppUrl: false,
		aliases: [ "群聊助手", "群助手" ]
	};
	public declare tips: string;
	public getMiniAppUrl: boolean;
	public aliases: string[];
	
	constructor( config: IGroupHelperConfig ) {
		this.getMiniAppUrl = config.getMiniAppUrl;
		this.aliases = config.aliases;
	}
}