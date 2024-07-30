//
//  ApiErrorModel.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2022/05/10.
//

// MARK: -
enum AuthError: Error {
    case noError
    case noSavedToken
    case settingError
    case idServerError
    case conflictError
    case unknown
}

class ApiErrorModel: Codable {
    var errorCode: Int?
    var message: String?
    var errors: [ApiErrorModel]?
}

class VoidModel: ApiErrorModel {
    // Coding keys
    enum CodingKeys: String, CodingKey {
        case errorCode      = "errorCode"
        case message        = "message"
        case errors         = "errors";
    }
    
    required init(from decoder: Decoder) throws {
        super.init()
        if let values = try? decoder.container(keyedBy: CodingKeys.self) {
            errorCode       = try? values.decode(Int.self, forKey: .errorCode)
            message         = try? values.decode(String.self, forKey: .message)
            errors          = try? values.decode([ApiErrorModel].self, forKey: .errors)
        }
        else {
            errorCode = 0
            message = nil
            errors = nil
        }
    }
}
