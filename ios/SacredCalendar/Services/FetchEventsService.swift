//
//  FetchEventsService.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

class FetchEventsService {
    
    func execute(query: [String : Any]) -> Observable<[Event]> {
        return Observable.create { observer in
            let request = API.request(.events, .list, query) { response in
                guard response.success else {
                    observer.onError(response.raw.error!)
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
