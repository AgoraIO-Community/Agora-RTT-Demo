//
//  Version.swift
//  Radio3DAudioSample
//
//  Created by Yuhua Hu on 2022/02/09.
//
import UIKit

public class AppInfo {
    
    /// bundle display name
    static public var bundleDisplayName: String {
        if let infos = Bundle(for: AppInfo.self).infoDictionary, let libName = infos[kCFBundleNameKey as String] {
            return "\(libName)"
        }
        return "Agora RTT Demo"
    }
    
    /// full version string
    /// like: version ??? (build ???)
    static public var fullVersionString: String {
        var libVersionString: String = ""
        // version number
        if let infos = Bundle(for: AppInfo.self).infoDictionary {
            let shortVersion = (infos["CFBundleShortVersionString"] as? String) ?? "N/A"
            let libBuildName = infos[kCFBundleVersionKey as String] ?? "N/A"
            //libVersionString = "\(libName) ver \(shortVersion)\nbuild \(libBuildName)"
            libVersionString = "version \(shortVersion) (build \(libBuildName))"
        }
        return libVersionString
    }
}
