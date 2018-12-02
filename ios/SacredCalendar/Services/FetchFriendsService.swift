//
//  FetchFriendsService.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

import RxCocoa
import RxSwift

/// Async operations for fetching friends.
class FetchFriendsService {
    
    func execute() -> Observable<[Friendship]> {
        return Observable.create { observer in
            let request = API.request(.friends, .list) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let friends = Friendship.create(from: response.data.array ?? []) else {
                    return
                }
                
                observer.onNext(friends)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasFetchFriendsService {
    var friends: FetchFriendsService { get }
}
