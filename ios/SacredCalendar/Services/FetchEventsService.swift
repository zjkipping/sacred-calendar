//
//  FetchEventsService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for fetching events.
class FetchEventsService {
    
    func execute() -> Observable<[Event]> {
        return Observable.create { observer in
            let request = API.request(.events, .list) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                defer {
                    observer.onCompleted()
                }
                
                guard let events = Event.create(from: response.data.arrayValue) else {
                    return
                }
                
                observer.onNext(events)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
    
    func executeFriendFetch(query: [String : Any]) -> Observable<[Event]> {
        return Observable.create { observer in
            let request = API.request(.friendEvents, .list, query) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let events = Event.create(from: response.data.arrayValue) else {
                    return
                }
                
                observer.onNext(events)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasFetchEventsService {
    var events: FetchEventsService { get }
}
