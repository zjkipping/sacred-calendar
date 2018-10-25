//
//  AuthService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

typealias Credentials = (username: String, password: String)

class AuthService {
    
    func login(credentials: Credentials) -> Observable<User> {
        return Observable.create { observer in
            let params = [
                "username" : credentials.username,
                "password" : credentials.password,
            ]
            let request = API.request(.auth, .login, params) { response in
                guard response.success else {
                    observer.onError(response.raw.error!)
                    return
                }
                
                guard let user = User(json: response.data["user"]) else {
                    return
                }
                
                observer.onNext(user)
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
                    observer.onError(response.raw.error!)
                    return
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
