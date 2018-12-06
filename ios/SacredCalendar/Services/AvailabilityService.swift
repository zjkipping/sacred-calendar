//
//  AvailabilityService.swift
//  SacredCalendar
//
//  Created by Developer on 12/4/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for fetching friends.
class AvailabilityService {
    
    func execute(query: [String : Any]) -> Observable<[AvailableFriend]> {
        return Observable.create { observer in
            let request = API.request(.availability, .list, query) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let friends = AvailableFriend.create(from: response.data.array ?? []) else {
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

protocol HasAvailabilityService {
    var availability: AvailabilityService { get }
}
