//
//  CommonRequestModel.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/11.
//

import UIKit

protocol CommonRequestModel: Codable {
    var dictionary: [String: Any]? { get }
}

extension CommonRequestModel {
    var dictionary: [String: Any]? {
      guard let data = try? JSONEncoder().encode(self) else { return nil }
      return (try? JSONSerialization.jsonObject(with: data, options: .allowFragments)).flatMap { $0 as? [String: Any] }
    }
}
