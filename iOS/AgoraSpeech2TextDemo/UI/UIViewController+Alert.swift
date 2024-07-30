//
//  BaseViewController.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

import UIKit

extension UIViewController {
    /// Show error alert
    func showAlert(title: String, message: String?, actions: [UIAlertAction] = []) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        if actions.count <= 0 {
            let closeAction = UIAlertAction(title: "OK", style: .default) { action in
                //
            }
            alert.addAction(closeAction)
        }
        else {
            actions.forEach({ action in
                alert.addAction(action)
            })
        }
        self.present(alert, animated: true) {
            //
        }
    }
}
