#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTBundleURLProvider.h>
#import <RNBranch/RNBranch.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  self.moduleName = @"GimmeGift";
  self.initialProps = @{};
  [RNBranch useTestInstance];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  NSURL *jsCodeLocation;
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
//   // Branch.io handling
//   if ([RNBranch application:app openURL:url options:options]) {
//     return YES;
//   }
//   // React Native Linking Manager handling
//   return [RCTLinkingManager application:app openURL:url options:options];
// }

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  [RNBranch application:app openURL:url options:options];
  return YES;
}

// - (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
//   // Branch.io handling
//   if ([RNBranch continueUserActivity:userActivity]) {
//     return YES;
//   }
//   // React Native Linking Manager handling
//   return [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
// }
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  [RNBranch continueUserActivity:userActivity];
  return YES;
}


- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
