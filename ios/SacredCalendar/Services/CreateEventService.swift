//
//  CreateEventService.swift
//  SacredCalendar
//
//  Created by Developer on 10/30/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for creating events.
class CreateEventService {
    func execute(data: [String : Any]) -> Observable<Int> {
        return Observable.create { observer in
            let request = API.request(.event, .create, data) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let id = response.data["id"].int else {
                    observer.onError(response.error!)
                    return
                }
                
                observer.onNext(id)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasCreateEventService {
    var events: CreateEventService { get }
}
