//
//  CreateCategoryService.swift
//  SacredCalendar
//
//  Created by Developer on 10/31/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

/// Async operations for creating categories.
class CreateCategoryService {
    
    func execute(data: [String : Any]) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.category, .create, data) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    observer.onCompleted()
                    return
                }
                observer.onNext(true)
                observer.onCompleted()
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasCreateCategoryService {
    var createCategory: CreateCategoryService { get }
}
