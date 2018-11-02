//
//  FormValidatorTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

class FormValidatorTests: XCTestCase {

    let controller = SignUpViewController()
    
    override func setUp() {
        
    }
    
    func testPasswordVerificationSuccess() {
        let result = controller.validate(password: "password", verification: "password")
        XCTAssertEqual(result, true)
    }
    
    func testPasswordVerificationFailure() {
        let result = controller.validate(password: "password", verification: "pass")
        XCTAssertEqual(result, false)
    }
    
    override func tearDown() {

    }
}
