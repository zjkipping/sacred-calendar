//
//  LookupUserIdService.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//
//

import RxCocoa
import RxSwift

/// Async operations for looking up a user's id.
class LookupUserIdService {
    
    func execute(username: String) -> Observable<Int?> {
        return Observable.create { observer in
            let request = API.request(.auth, .lookup, ["username" : username]) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard response.success else {
                    observer.onNext(nil)
                    return
                }
                
                guard let result = response.data.array?.first else {
                    observer.onNext(nil)
                    return
                }
                
                observer.onNext(result["id"].int)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasLookupUserIdService {
    var lookupUser: LookupUserIdService { get }
}
