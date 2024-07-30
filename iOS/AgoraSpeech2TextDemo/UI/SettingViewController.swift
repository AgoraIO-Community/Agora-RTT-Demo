//
//  SettingViewController.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/06/07.
//

import UIKit
import SwiftUI

class SettingViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        let settingView = SettingUIView()
        let hostingVC = UIHostingController(rootView: settingView)
        hostingVC.view.frame = self.view.bounds
        self.addChild(hostingVC)
        self.view.addSubview(hostingVC.view)
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
