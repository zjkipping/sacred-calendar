//
//  CreateUserService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

import RxCocoa
import RxSwift

class CreateUserService {
    
    func execute() -> Observable<User> {
        return Observable.create { observer in
            let request = API.request(.users, .create) { response in
                guard response.success else {
                    observer.onError(response.raw.error!)
                    return
                }
                
                guard let user = User(json: response.data) else {
                    return
                }
                
                observer.onNext(user)
            }

            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasCreateUserService {
    var user: CreateUserService { get }
}
