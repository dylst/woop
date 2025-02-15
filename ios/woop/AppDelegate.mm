#import "AppDelegate.h"

// ✅ Google Maps Import (Safe Check)
#if __has_include(<GoogleMaps/GoogleMaps.h>)
#import <GoogleMaps/GoogleMaps.h>
#endif

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // ✅ Load API Key securely from Info.plist (No hardcoded keys)
    #if __has_include(<GoogleMaps/GoogleMaps.h>)
        NSString *apiKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"GMSApiKey"];
        if (apiKey) {
            [GMSServices provideAPIKey:apiKey];
        } else {
            NSLog(@"❌ Google Maps API Key is missing in Info.plist");
        }
    #endif

    self.moduleName = @"main";
    self.initialProps = @{}; // ✅ Keep as is

    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// ✅ Handles JS Bundle Loading
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
    return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// ✅ Linking API for Deep Linking
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// ✅ Universal Links Handling
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
    BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
    return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// ✅ Push Notification Handlers
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end