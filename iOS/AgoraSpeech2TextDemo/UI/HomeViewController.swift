//
//  ViewController.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/09.
//

import UIKit
import MediaPlayer
import DarkEggKit

class HomeViewController: UIViewController {
    @IBOutlet private weak var channelNameField: UITextField!
    @IBOutlet private weak var nicknameField: UITextField!
    @IBOutlet private weak var joinButton: UIButton!
    @IBOutlet private weak var audienceButton: UIButton!
    
    @IBOutlet private weak var sttLanguageStackView: UIStackView!
    @IBOutlet private weak var clearLanaguageButton: UIButton!
    @IBOutlet private weak var tanslateLanguageStackView: UIStackView!
    @IBOutlet private weak var clearTranslateLanaguageButton: UIButton!
    
    @IBOutlet private weak var languageButton: UIButton!
    @IBOutlet private weak var translateLanguageButton: UIButton!
    @IBOutlet private weak var languagePicker: UIPickerView!
    
    private var languageLabels: [UILabel] = []
    private var languageList: [AgoraSTTLanguage] = [.english]
    
    private var translateLanguageLabels: [UILabel] = []
    private var translateLanguageList: [AgoraSTTLanguage] = []
    
    private let maxTranscriptionTargetCount: Int = 2
    private let maxTranslationTargetCount: Int = 5

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }
    
    override func viewDidAppear(_ animated: Bool) {
        self.renewSttLanguageLabels()
    }
}

extension HomeViewController {
    private func fillLanguageList() {
        for lang in AgoraSTTLanguage.allCases {
            Logger.debug(lang.displayName)
        }
    }
}

extension HomeViewController {
    @IBAction private func onJoinButtonClicked(_ sender: UIButton) {
        Logger.debug()
        if checkChannelName() {
            self.performSegue(withIdentifier: "EnterChatRoom", sender: sender)
        }
    }
    
    @IBAction private func onAudienceButtonClicked(_ sender: UIButton) {
        Logger.debug()
//        Text2SpeechManager.shared.convert(text: "Hello, this is test.")
//        return
        if checkChannelName() {
            self.performSegue(withIdentifier: "EnterChatRoom", sender: sender)
        }
    }
    
    @IBAction private func onAddSttLanguageButtonClicked(_ sender: UIButton) {
        let idx = self.languagePicker.selectedRow(inComponent: 0)
        let lang = AgoraSTTLanguage.allCases[idx]
        
        guard !(self.languageList.contains(lang)) else {
            Logger.debug("This language is already selected.")
            DZPopupMessage.show("This language is already selected.", type: .warning)
            return
        }
        
        self.languageList.append(lang)
        if languageList.count > 2 {
            languageList.remove(at: 0)
        }
        self.renewSttLanguageLabels()
    }
    
    private func renewSttLanguageLabels() {
        if languageLabels.count >= 2, languageList.count >= 2 {
            // change label text
            languageLabels[0].text = languageList[0].displayName
            languageLabels[1].text = languageList[1].displayName
        }
        else if languageLabels.count < languageList.count {
            // add one label
            let label = UILabel()
            label.frame = CGRect(x: 0, y: 0, width: 100, height: 35)
            label.text = languageList.last?.displayName
            label.font = .systemFont(ofSize: 15.0, weight: .medium)
            label.textAlignment = .center
            label.backgroundColor = .secondarySystemBackground
            self.sttLanguageStackView.addArrangedSubview(label)
            self.languageLabels.append(label)
        }
    }
    
    @IBAction private func onAddTranslateLanguageButtonClick(_ sender: UIButton) {
        let idx = self.languagePicker.selectedRow(inComponent: 0)
        let lang = AgoraSTTLanguage.allCases[idx]
        
        guard !(self.translateLanguageList.contains(lang)) else {
            Logger.debug("This language is already selected.")
            DZPopupMessage.show("This language is already selected.", type: .warning)
            return
        }
        
        self.translateLanguageList.append(lang)
        if translateLanguageList.count > 5 {
            translateLanguageList.remove(at: 0)
        }
        self.renewTranslateLanguageLabels()
    }
    
    private func renewTranslateLanguageLabels() {
        Logger.debug()
        if translateLanguageLabels.count >= 5, translateLanguageList.count >= 5 {
            // change label text
            translateLanguageLabels[0].text = translateLanguageList[0].displayName
            translateLanguageLabels[1].text = translateLanguageList[1].displayName
            translateLanguageLabels[2].text = translateLanguageList[2].displayName
            translateLanguageLabels[3].text = translateLanguageList[3].displayName
            translateLanguageLabels[4].text = translateLanguageList[4].displayName
        }
        else if translateLanguageLabels.count < translateLanguageList.count {
            // add one label
            let label = UILabel()
            label.frame = CGRect(x: 0, y: 0, width: 100, height: 35)
            label.text = translateLanguageList.last?.rawValue //displayName
            label.font = .systemFont(ofSize: 12.0, weight: .medium)
            label.textAlignment = .center
            label.backgroundColor = .secondarySystemBackground
            self.tanslateLanguageStackView.addArrangedSubview(label)
            self.translateLanguageLabels.append(label)
        }
    }
    
    @IBAction private func onClearLanaguageButtonClicked(_ sender: UIButton) {
        self.languageList.removeAll()
        self.languageLabels.forEach { lbl in
            lbl.removeFromSuperview()
        }
        self.languageLabels.removeAll()
    }
    
    @IBAction private func onClearTranslateLanaguageButtonClicked(_ sender: UIButton) {
        self.translateLanguageList.removeAll()
        self.translateLanguageLabels.forEach { lbl in
            lbl.removeFromSuperview()
        }
        self.translateLanguageLabels.removeAll()
    }
    
    /// Check channel name
    private func checkChannelName() -> Bool {
        guard let channelName = channelNameField.text, !channelName.isEmpty,
                let nicknaem = self.nicknameField.text, !nicknaem.isEmpty else {
            Logger.debug("Please fill channel name and nickname.")
            self.showAlert(title: "Cannot proceed", message: "Please fill channel name and nickname.")
            return false
        }
        
        guard self.languageList.count > 0 else {
            Logger.debug("Please select at least 1 STT language.")
            self.showAlert(title: "Cannot proceed", message: "Please select at least 1 STT language.")
            return false
        }
        
        return true
    }
    
    @IBAction private func onViewTapped(_ sender: UITapGestureRecognizer?) {
        self.view.endEditing(true)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "EnterChatRoom" {
            if let destinationVC = segue.destination as? ChatRoomViewController {
                let _ = AgoraManager.sharedInstance(withApiServer: false)
                destinationVC.channelName = channelNameField.text
                destinationVC.nickname = nicknameField.text
                destinationVC.languageList = self.languageList
                destinationVC.translateLanguageList = self.translateLanguageList
                if let btn = sender as? UIButton, btn == self.joinButton {
                    destinationVC.isHost = true
                }
                else {
                    destinationVC.isHost = false
                }
            }
        }
    }
    
    
    
    @IBAction private func onSettingButtonClicked(sender: AnyObject?) {
        self.performSegue(withIdentifier: "EnterSetting", sender: self)
    }
}

extension HomeViewController: UIPickerViewDelegate {
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        return AgoraSTTLanguage.allCases[row].displayName
    }
}

extension HomeViewController: UIPickerViewDataSource {
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return AgoraSTTLanguage.allCases.count
    }
}
