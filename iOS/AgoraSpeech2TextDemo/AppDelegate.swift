//
//  AppDelegate.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/09.
//

import UIKit
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate {



    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        //let _: AgoraManager = AgoraManager.shared
        application.isIdleTimerDisabled = true
        
        SettingManager.shared.loadKeywords()
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setActive(true)
            try audioSession.setCategory(.playback)
        }
        catch {
            print(error)
        }
        application.beginReceivingRemoteControlEvents()
        
        // try
//        let _ = AppConfig.shared.loadPlist()
        
        return true
    }

    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // leave channel
        AgoraManager.shared.delegate = nil
        switch STTManager.shared.state {
        case .started:
            // quit stt service
            STTManager.shared.stop()
            break;
        default:
            break;
        }
        AgoraManager.shared.leave()
        AgoraManager.shared.destroyRtcEngine()
    }

}

