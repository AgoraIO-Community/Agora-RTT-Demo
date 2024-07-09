//
//  STTSubtitleCell.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/19.
//

import DarkEggKit

class STTSubtitleCell: UITableViewCell {
    @IBOutlet weak private var uidLabel: UILabel!
    @IBOutlet weak private var subtitleLabel: UILabel!
    @IBOutlet weak private var translationLabel: UILabel!
    @IBOutlet weak private var translationLabelBottom: NSLayoutConstraint!
    
    private var isAllFinal: Bool = false
    
    var subtitle: SubTitle? {
        didSet {
//            translationLabel.backgroundColor = .red
            self.uidLabel.text = "\(subtitle?.nickname ?? "N/A")(\(subtitle?.uid ?? 0))[\(subtitle?.time ?? 0)][\(subtitle?.durationMs ?? 0)]"
            self.subtitleLabel.text = subtitle?.text ?? ""
            if let translation = subtitle?.translation, translation.count > 0 {
                var transText: String = ""
                //Logger.debug("[1018]Translation from agora: \(translation)")
                let keys = translation.keys.sorted()
                for (idx, k) in keys.enumerated() {
                    transText += "[\(k)] \(translation[k] ?? "")"
                    if idx != keys.count - 1 {
                        transText += "\n"
                    }
                }
//                for (idx, s) in translation.enumerated().sorted(by: { a, b in
//                    a.element.key > b.element.key
//                }) {
//                    if idx == translation.count - 1 {
//                        transText += "[\(s.key)] \(s.value) - end"
//                    }
//                    else {
//                        transText +=  "[\(s.key)] \(s.value)\n"
//                    }
//                }
                self.translationLabel.isHidden = false
                self.translationLabelBottom.constant = 8
                self.translationLabel.text = transText
            }
            else {
                //Logger.debug("[1018]No translation")
                // call translate
//                if let temp = subtitle?.text {
//                    TranslateManager.shared.getTranslation(of: temp, sourceLanaguage: "en", targetLanaguage: "zh-Hans") { resText in
//                        Logger.debug("Translation from ms: \(resText ?? "N/A")")
//                        self.translationLabel.isHidden = false
//                        self.translationLabel.text = resText
//                    }
//                }
                self.translationLabel.isHidden = true
                self.translationLabelBottom.constant = 0
                self.translationLabel.text = nil
            }
        }
    }
}
