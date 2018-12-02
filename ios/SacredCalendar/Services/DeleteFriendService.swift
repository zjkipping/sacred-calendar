//
//  DeleteFriendService.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for fetching friends.
class DeleteFriendService {
    
    func execute(id: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.friends, .delete(id: id)) { response in
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

protocol HasDeleteFriendService {
    var removeFriend: DeleteFriendService { get }
}

