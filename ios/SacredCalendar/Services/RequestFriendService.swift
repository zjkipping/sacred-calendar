//
//  RequestFriendService.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for fetching friends.
class RequestFriendService {
    
    func execute(userId: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.friendRequests, .create, ["id" : userId]) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard response.success else {
                    observer.onNext(false)
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

protocol HasRequestFriendService {
    var requestFriend: RequestFriendService { get }
}


