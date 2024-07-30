//
//  Date+Formatted.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/13.
//

//import Foundation

extension Date {
   func formattedString(_ format: String) -> String {
        let dateformat = DateFormatter()
        dateformat.dateFormat = format
        return dateformat.string(from: self)
    }
}
