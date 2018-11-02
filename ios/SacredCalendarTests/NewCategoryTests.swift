//
//  NewCategoryTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

class NewCategoryTests: XCTestCase {
    
    typealias FormValidator = NewCategoryViewController.FormValidator
    
    let controller = NewCategoryViewController()
    
    override func setUp() {
        
    }
    
    func testFormValidation() {
        XCTAssertTrue(FormValidator.validate(name: "name", color: "#000000"))
       
        XCTAssertFalse(FormValidator.validate(name: "", color: "#000000"))
        XCTAssertFalse(FormValidator.validate(name: "name", color: ""))
        XCTAssertFalse(FormValidator.validate(name: "", color: ""))
    }
    
    func testFormValidationName() {
        XCTAssertTrue(FormValidator.validate(name: "name"))
        
        XCTAssertFalse(FormValidator.validate(name: ""))
    }
    
    func testFormValidationColor()  {
        XCTAssertTrue(FormValidator.validate(color: "#000000"))
        
        XCTAssertFalse(FormValidator.validate(color: ""))
    }
    
    override func tearDown() {

    }
}
