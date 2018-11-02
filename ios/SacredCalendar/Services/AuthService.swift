//
//  AuthService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import SwiftKeychainWrapper
import RxCocoa
import RxSwift

typealias Credentials = (username: String, password: String)

enum TokenKey: String {
    case auth = "auth-token"
    case refresh = "refresh-token"
}

/// Async operations for auth.
class AuthService {
    
    func login(credentials: Credentials) -> Observable<(Bool, String?)> {
        return Observable.create { observer in
            let params = [
                "username" : credentials.username,
                "password" : credentials.password,
            ]
            let request = API.request(.auth, .login, params) { response in
                guard response.success else {
                    
                    let error = response.error! as NSError
                    
                    let message = error.userInfo["message"] as? String
                   
                    observer.onNext((false, message ?? ""))
                    return
                }
                
                if let authToken = response.data["token"].string {
                    KeychainWrapper.standard.set(authToken, forKey: TokenKey.auth.rawValue)
                }
                
                if let refreshToken = response.data["refreshToken"].string {
                    KeychainWrapper.standard.set(refreshToken, forKey: TokenKey.refresh.rawValue)
                }
                
                observer.onNext((true, nil))
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
    
    func logout() -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.auth, .logout) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                KeychainWrapper.standard.removeObject(forKey: TokenKey.auth.rawValue)
                KeychainWrapper.standard.removeObject(forKey: TokenKey.refresh.rawValue)
                
                observer.onNext(true)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
    
    func refreshToken() -> Observable<Bool> {
        return Observable.create { observer in
            var params: [String : Any]?
            if let refreshToken = KeychainWrapper.standard.string(forKey: TokenKey.refresh.rawValue) {
                params = ["refreshToken" : refreshToken]
            }

            let request = API.request(.auth, .refreshToken, params) { response in
                guard response.success else {
                    return
                }
                
                if let token = response.data["token"].string {
                    KeychainWrapper.standard.set(token, forKey: TokenKey.auth.rawValue)
                } else {
                    let message = [
                        "code" : "MISSING_AUTH_TOKEN",
                        "message" : "Response from server did not contain an auth token."
                    ]
                    let error = NSError(domain: "com.sacredcalendar", code: 100, userInfo: message)
                    observer.onError(error)
                }
                
                observer.onNext(true)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasAuthService {
    var auth: AuthService { get }
}
