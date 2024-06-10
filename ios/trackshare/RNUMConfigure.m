
#import "RNUMConfigure.h"
#import <UMShare/UMShare.h>
#import "Constants.h"

@implementation RNUMConfigure

+ (void)initWithAppkey:(NSString *)appkey channel:(NSString *)channel
{
  SEL sel = NSSelectorFromString(@"setWraperType:wrapperVersion:");
  if ([UMConfigure respondsToSelector:sel]) {
    [UMConfigure performSelector:sel withObject:@"react-native" withObject:@"1.0"];
  }
  [UMConfigure initWithAppkey:appkey channel:channel];
  
  // 以下仅列出U-Share初始化部分
  
  // U-Share 平台设置
  [self configUSharePlatforms];
  [self confitUShareSettings];
  
}

+ (void)confitUShareSettings
{
  /*
   * 打开图片水印
   */
  //[UMSocialGlobal shareInstance].isUsingWaterMark = YES;
  
  /*
   * 关闭强制验证https，可允许http图片分享，但需要在info.plist设置安全域名
   <key>NSAppTransportSecurity</key>
   <dict>
   <key>NSAllowsArbitraryLoads</key>
   <true/>
   </dict>
   */
  [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
  
}

+(void)configUSharePlatforms
{
  // 微信、QQ、微博完整版会校验合法的universalLink，不设置会在初始化平台失败
     //配置微信Universal Link需注意 universalLinkDic的key是rawInt类型，不是枚举类型 ，即为 UMSocialPlatformType.wechatSession.rawInt
  [UMSocialGlobal shareInstance].universalLinkDic =@{@(UMSocialPlatformType_WechatSession):@"https://www.devio.org/",
  @(UMSocialPlatformType_QQ):@"https://www.devio.org/",
   @(UMSocialPlatformType_Sina):@"https://www.devio.org/"};
  
  //设置微信的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:AppKey_WX appSecret:AppSecret_WX redirectURL:@"http://mobile.umeng.com/social"];
  
  
  //设置分享到QQ互联的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:AppKey_QQ  appSecret:AppSecret_QQ redirectURL:@"http://mobile.umeng.com/social"];
  
  //设置新浪的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:AppKey_WB  appSecret:AppSecret_WB redirectURL:@"http://sns.whalecloud.com/sina2/callback"];
}

@end

