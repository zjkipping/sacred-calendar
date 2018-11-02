//
//  CreateUserService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for creating users.
class CreateUserService {
    func execute(data: [String : Any]) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.auth, .register, data) { response in
                guard response.success else {
                    observer.onError(response.error!)
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

protocol HasCreateUserService {
    var user: CreateUserService { get }
}
