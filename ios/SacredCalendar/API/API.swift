//
//  API.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation
import Alamofire
import SwiftyJSON

typealias JSON = SwiftyJSON.JSON

protocol Cancelable {
    func cancel()
}

extension DataRequest: Cancelable { }

enum Resource: String {
    case auth, events, categories, users
}

enum Action {
    case get(id: String)
    case create
    case update(id: String)
    case delete(id: String)
    case list
    case login
    case logout
}

class API {

    static let apiEndpoint = "http://"
     
    static func request(_ resource: Resource,
                          _ action: Action,
                      _ parameters: Parameters? = nil,
                          encoding: ParameterEncoding = JSONEncoding.default,
                           headers: HTTPHeaders? = nil,
                          callback: @escaping (ValidatedResponse) -> Void) -> Cancelable {
        
        let url = API.url(for: resource, action: action)
        let method = API.method(for: action)
        
        let encoding = method == .get ? URLEncoding.default : encoding
        
        print("API \(method.rawValue) : \(url)")
       
        return Alamofire.request(url, method: method, parameters: parameters, encoding: encoding, headers: headers).responseJSON {
            
            guard let response = API.validate(data: $0) else { return }
            
            callback(response)
        }
    }
    
    private static func method(for action: Action) -> HTTPMethod {
        switch action {
        case .get: return .get
        case .list: return .get
        case .create: return .put
        case .update: return .patch
        case .delete: return .delete
        case .login: return .post
        case .logout: return .post
        }
    }
    
    private static func url(for resource: Resource, action: Action) -> String {
        return url(for: resource) / endpoint(for: action)
    }
    
    private static func endpoint(for action: Action) -> String {
        switch action {
        case .get(let id):      return id
        case .create:           return ""
        case .update(let id):   return id
        case .list:             return "list"
        case .login:            return "login"
        case .logout:           return "logout"
        case .delete(let id):   return id
        }
    }
    
    private static func url(for resource: Resource) -> String {
        return apiEndpoint / resource.rawValue
    }
    
    static func validate(data: DataResponse<Any>) -> ValidatedResponse? {
        guard let response = data.response else { return nil }
        
        return ValidatedResponse(raw: data,
                          statusCode: response.statusCode,
                                data: JSON(data.result.value as Any))
    }
}
