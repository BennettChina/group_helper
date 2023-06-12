import { RefreshCatch } from "@modules/management/refresh";
import { PluginAlias } from "@modules/plugin";
import FileManagement from "@modules/file";

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
	
	public static create( file: FileManagement ): GroupHelperConfig {
		const initCfg = this.init;
		
		const path: string = file.getFilePath( `${ this.FILE_NAME }.yml` );
		const isExist: boolean = file.isExist( path );
		if ( !isExist ) {
			file.createYAML( this.FILE_NAME, initCfg );
			return new GroupHelperConfig( initCfg );
		}
		
		const config: any = file.loadYAML( this.FILE_NAME );
		const keysNum = o => Object.keys( o ).length;
		
		/* 检查 defaultConfig 是否更新 */
		if ( keysNum( config ) !== keysNum( initCfg ) ) {
			const c: any = {};
			const keys: string[] = Object.keys( initCfg );
			for ( let k of keys ) {
				c[k] = config[k] ? config[k] : initCfg[k];
			}
			file.writeYAML( this.FILE_NAME, c );
			return new GroupHelperConfig( c );
		}
		return new GroupHelperConfig( config );
	}
	
	public async refresh( config: IGroupHelperConfig ): Promise<string> {
		try {
			this.getMiniAppUrl = config.getMiniAppUrl;
			
			for ( const alias of this.aliases ) {
				Reflect.deleteProperty( PluginAlias, alias );
			}
			this.aliases = config.aliases;
			for ( const alias of this.aliases ) {
				Reflect.set( PluginAlias, alias, "group_helper" );
			}
			
			return `${ GroupHelperConfig.FILE_NAME }.yml 重新加载完毕`;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `${ GroupHelperConfig.FILE_NAME }.yml 重新加载失败，请前往控制台查看日志`
			};
		}
	}
}