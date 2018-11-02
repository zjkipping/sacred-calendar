//
//  APITests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import RxCocoa
import RxSwift
import XCTest
@testable import SacredCalendar

infix operator /

class APITests: XCTestCase {
    
    override func setUp() {
        
    }
    
    func testUrlForResourceAndAction() {
        let resource = Resource.events
        let action = Action.get(id: 0)

        let resourceUrl = API.url(for: resource)
        let actionUrl = API.endpoint(for: action)
        
        XCTAssertEqual(resourceUrl / actionUrl, API.url(for: resource, action: action))
    }
    
    override func tearDown() {
        
    }
}
