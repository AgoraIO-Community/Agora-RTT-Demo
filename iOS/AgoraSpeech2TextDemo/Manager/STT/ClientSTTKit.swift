//
//  ClientSTTKit.swift
//  AgoraSpeech2TextDemo
//
//  Created by Yuhua Hu on 2023/03/10.
//

import PromiseKit
import DarkEggKit

class ClientSTTKit: STTProtocol {
    static let shared: ClientSTTKit = { ClientSTTKit() }()
    func start(channel: String, language: [AgoraSTTLanguage] = [.english],
                 captionConfig : ClientSTTApiRequestModel.AgoraRTTStartRequestCaptionConfig? = nil,
                 tanslateConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig? = nil,
                 completion: ((Bool, STTManagerError?)->Void)? = nil) {
        
        // app client solution
        self.requestAcquire(channel: channel).then { (acquireRes) -> Promise<ClientSTTApiResponseModel.Start> in
            guard let token = acquireRes.tokenName else {
                return Promise { seal in
                    seal.reject(STTManagerError.acquireFailed)
                }
            }
            // start
            STTManager.shared.token = token
            let arr = language.stringArray()
            let startPromise: Promise<ClientSTTApiResponseModel.Start> = self.requestStart(channel: channel,
                                                                                           token: token,
                                                                                           language: arr,
                                                                                           audioUid: 998,
                                                                                           dataStreamUid: 999,
                                                                                           captionConfig: captionConfig,
                                                                                           translateConfig: tanslateConfig)
            return startPromise
        }.done { startRes in
            guard let taskId = startRes.taskId else {
                throw STTManagerError.startFailed
            }
            Logger.debug("start success.")
            completion?(true, .success(taskId))
            return
        }.catch { error in
            Logger.debug("start failed. \(error)")
            guard let err = error as? APIError else {
                completion?(false, STTManagerError.startFailed)
                return
            }
            switch err {
            case .serverError(let statusCode, let error):
                Logger.debug(error)
                switch statusCode {
                case 409:
                    Logger.debug("conflict taskId is \("aaaa")")
                    // Get task id
                    let taskId: String = ""
                    completion?(true, STTManagerError.conflict(taskId))
                    break
                default:
                    completion?(true, STTManagerError.startFailed)
                    break;
                }
            default:
                self.stop(channel: channel) { success, res in
                }
                completion?(false, STTManagerError.startFailed)
                break
            }
        }.finally {
            // Logger.debug("start finished.")
        }
    }
    
    func query(completion: ((Bool, STTManagerError?)->Void)? = nil) {
        
    }
    
    func stop(channel: String, completion: ((Bool, STTManagerError?)->Void)? = nil) {
        if let token = STTManager.shared.token, let taskId = STTManager.shared.taskId {
            self.requestStop(token: token, taskId: taskId).done { res in
                //
                completion?(true, nil)
            }.catch { error in
                //
                completion?(false, STTManagerError.stopFailed)
            }.finally {
                //
            }
        }
    }
}

extension ClientSTTKit {
    private func requestAcquire(channel: String) -> Promise<ClientSTTApiResponseModel.Acquire> {
        let appId = AppConfig.shared.agora.appId
        var api = ClientSTTApi.Acquire(appId: appId)
        api.parameter = ["instanceId": channel]
//        return api.request()
        return api.request() //(serverUrl: "http://60.191.137.172:16000")
    }
    
    private func requestStart(channel: String,
                                token: String,
                                language: [String],
                                audioUid: UInt,
                                dataStreamUid: UInt,
                                captionConfig : ClientSTTApiRequestModel.AgoraRTTStartRequestCaptionConfig? = nil,
                                translateConfig: ClientSTTApiRequestModel.AgoraRTTStartRequestTranslateConfig? = nil) -> Promise<ClientSTTApiResponseModel.Start> {
        let appId = AppConfig.shared.agora.appId
        var api = ClientSTTApi.Start(appId: appId, token: token)
        
        var requestBody = ClientSTTApiRequestModel.Strat(channelName: channel, language: language, audioUid: "\(audioUid)", dataStreamUid: "\(dataStreamUid)")
        
        if captionConfig != nil {
            requestBody.captionConfig = captionConfig
        }
        if translateConfig != nil {
            requestBody.translateConfig = translateConfig
        }
        
        api.parameter = requestBody.dictionary
        return api.request() //(serverUrl: "http://60.191.137.172:16000")
        
    }
    
    private func requestQuery(token: String, taskId: String) -> Promise<ClientSTTApiResponseModel.Query> {
        let appId = AppConfig.shared.agora.appId
        let api = ClientSTTApi.Query(appId: appId, token: token, taskId: taskId)
        return api.request()
    }
    
    private func requestStop(token: String, taskId: String) -> Promise<ClientSTTApiResponseModel.Stop> {
        let appId = AppConfig.shared.agora.appId
        let api = ClientSTTApi.Stop(appId: appId, token: token, taskId: taskId)
        return api.request()
    }
}
