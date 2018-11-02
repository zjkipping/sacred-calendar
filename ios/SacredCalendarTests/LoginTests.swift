//
//  SacredCalendarTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 9/19/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

class LoginTests: XCTestCase {

    let controller = LoginViewController()
    
    override func setUp() {
        
    }
    
    func testFormValidationSuccess() {
        let result = controller.validateForm(username: "username", password: "password")
        XCTAssertEqual(result, .valid)
    }
    
    func testFormValidationMissingUsername() {
        let result = controller.validateForm(username: "", password: "password")
        XCTAssertNotEqual(result, .valid)
    }
    
    func testFormValidationMissingPassword() {
        let result = controller.validateForm(username: "username", password: "")
        XCTAssertNotEqual(result, .valid)
    }

    override func tearDown() {

    }
}
