//
//  OperatorsTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

infix operator /

class OperatorsTests: XCTestCase {
    
    override func setUp() {
        
    }
    
    func testPathAppend() {
        XCTAssertEqual("domain" / "endpoint", "domain/endpoint")
    }
   
    override func tearDown() {

    }
}
