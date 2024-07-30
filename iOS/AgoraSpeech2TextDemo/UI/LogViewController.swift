//
//  LogViewController.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/06/16.
//

import UIKit
import DarkEggKit

enum LogDisplayType: String {
    case allTranscription
    case conversation
    case translation
//    case characterCount
}

class LogViewController: UIViewController {
    @IBOutlet private weak var closeButton: UIButton!
    @IBOutlet private weak var copyButton: UIButton!
    @IBOutlet private weak var logTextView: UITextView!
    @IBOutlet private weak var summaryButton: UIButton!
    
    var logDisplayType: LogDisplayType = .allTranscription
    
    let sttMgr: STTManager = .shared
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        self.logTextView.text = ""
        self.summaryButton.isHidden = true
    }
    
    override func viewDidAppear(_ animated: Bool) {
        switch logDisplayType {
        case .allTranscription:
            self.logTextView.text = sttMgr.allTranscription()
            self.summaryButton.isHidden = false
            break
        case .conversation:
            self.logTextView.text = sttMgr.allConversation()
            break
        case .translation:
            self.logTextView.text = sttMgr.translation()
            break
        }
    }
}

extension LogViewController {
    @IBAction private func onCloseButtonClicked(_ sender: UIButton) {
        self.dismiss(animated: true)
    }
    
    @IBAction private func onCopyButtonClicked(_ sender: UIButton) {
        UIPasteboard.general.string = self.logTextView.text
    }
}
