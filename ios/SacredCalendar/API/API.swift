//
//  API.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import SwiftKeychainWrapper

import Alamofire
import SwiftyJSON

typealias JSON = SwiftyJSON.JSON

protocol Cancelable {
    func cancel()
}

extension DataRequest: Cancelable { }

/// Keys for HTTP headers
enum HeaderKey: String {
    case authToken = "x-access-token"
}

/// Representation of possible backend resources.
enum Resource: String {
    case auth = ""
    case event, events, category, categories, users, friends, availability
    case friendRequests = "friend-requests"
    case friendEvents = "friend"
    case eventInvites = "event-invites"
}

/// Representation of possible backend actions.
enum Action {
    case get(id: Int)
    case create
    case update(id: Int)
    case delete(id: Int)
    case list
    case login
    case logout
    case refreshToken
    case register
    case `self`
    case lookup
    case accept
    case deny
    case invite
}

class API {
    /// The backend endpoint for the current environment.
    static let apiEndpoint = Configuration.environment
    
    /// Initiates a request for the provided options.
    static func request(_ resource: Resource,
                          _ action: Action,
                      _ parameters: Parameters? = nil,
                          encoding: ParameterEncoding = JSONEncoding.default,
                           headers: HTTPHeaders? = nil,
                        isRetrying: Bool = false,
                          callback: @escaping (ValidatedResponse) -> Void) -> Cancelable {
        
        let url = API.url(for: resource, action: action)
        let method = API.method(for: action)
        
        // determines encoding type per request
        let encoding = method == .get ? URLEncoding.default : encoding
        
        print("API \(method.rawValue) : \(url)")
        
        var options = headers ?? [:]
        
        // populates auth token for each request if available
        if let authToken = KeychainWrapper.standard.string(forKey: TokenKey.auth.rawValue) {
            options[HeaderKey.authToken.rawValue] = authToken
        }

        // initiates request
        return Alamofire.request(url, method: method, parameters: parameters, encoding: encoding, headers: options).validate({ request, response, data -> Request.ValidationResult in
            
            let userInfo = data == nil ? nil : JSON(data).dictionaryObject
            
            if !(200..<300).contains(response.statusCode) {
                let error = NSError(domain: "none",
                                      code: response.statusCode,
                                      userInfo: userInfo)
                return .failure(error)
            } else {
                return .success
            }
        }).responseJSON {
            
            guard let response = API.validate(data: $0) else { return }

            if let error = response.error {
                print("API Error Response : \(error)")
            } else {
                print("API Response : \(response.data)")
            }

            let isRefreshingToken = url.contains(endpoint(for: .refreshToken))

            guard response.statusCode != 401 || isRetrying || isRefreshingToken else {
                // retrys the request if failed due to permissions
                
                let auth = AuthService()
                _ = auth.refreshToken()
                    .take(1)
                    .subscribe(onNext: { _ in
                        _ = API.request(resource, action, parameters, encoding: encoding, headers: headers, isRetrying: true, callback: callback)
                    })
                return
            }

            callback(response)
        }
    }
    
    /// Transforms an action to an HTTP method.
    static func method(for action: Action) -> HTTPMethod {
        switch action {
        case .get:          return .get
        case .list:         return .get
        case .create:       return .post
        case .update:       return .patch
        case .delete:       return .delete
        case .login:        return .post
        case .logout:       return .post
        case .refreshToken: return .post
        case .register:     return .post
        case .`self`:       return .get
        case .lookup:       return .get
        case .accept:       return .post
        case .deny:         return .post
        case .invite:       return .post
        }
    }
    
    /// Maps a resource & action combonation to a usable url route.
    static func url(for resource: Resource, action: Action) -> String {
        return url(for: resource) / endpoint(for: action)
    }
    
    /// Maps an action to a url endpoint.
    static func endpoint(for action: Action) -> String {
        switch action {
        case .get(let id):      return String(id)
        case .create:           return ""
        case .update(let id):   return String(id)
        case .delete(let id):   return String(id)
        case .list:             return ""
        case .login:            return "login"
        case .logout:           return "logout"
        case .refreshToken:     return "refreshToken"
        case .register:         return "register"
        case .`self`:           return "self"
        case .lookup:           return "fr-typeahead"
        case .accept:           return "accept"
        case .deny:             return "deny"
        case .invite:           return "invite"
        }
    }
    
    /// Maps a resource to a url endpoint.
    static func url(for resource: Resource) -> String {
        let resourceUrl = resource.rawValue
        return resourceUrl.isEmpty ? apiEndpoint : apiEndpoint / resourceUrl
    }
    
    /// Validates response presence and wraps the response from HTTP library.
    static func validate(data: DataResponse<Any>) -> ValidatedResponse? {
        guard let response = data.response else { return nil }
        
        return ValidatedResponse(raw: data,
                          statusCode: response.statusCode,
                                data: JSON(data.result.value as Any))
    }
}
