//
//  DeleteEventService.swift
//  SacredCalendar
//
//  Created by Developer on 10/30/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

class DeleteEventService {
    func execute(id: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.event, .delete(id: id)) { response in
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

protocol HasDeleteEventService {
    var deleteEvent: DeleteEventService { get }
}
