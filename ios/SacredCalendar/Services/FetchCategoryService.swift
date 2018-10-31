//
//  FetchCategoryService.swift
//  SacredCalendar
//
//  Created by Developer on 10/31/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift

class FetchCategoryService {
    
    func execute() -> Observable<[Category]> {
        return Observable.create { observer in
            let request = API.request(.categories, .list) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    observer.onCompleted()
                    return
                }
                
                guard let categories = Category.create(from: response.data.arrayValue) else {
                    return
                }
                
                observer.onNext(categories)
                observer.onCompleted()
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasFetchCategoryService {
    var fetchCategories: FetchCategoryService { get }
}
