//
//  FetchUserService.swift
//  SacredCalendar
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

import RxCocoa
import RxSwift

/// Async operations for fetching users.
class FetchUserService {
    
    func execute() -> Observable<User> {
        return Observable.create { observer in
            let request = API.request(.auth, .`self`) { response in
                guard response.success else {
                    observer.onError(response.error!)
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

protocol HasFetchUserService {
    var fetchUser: FetchUserService { get }
}
