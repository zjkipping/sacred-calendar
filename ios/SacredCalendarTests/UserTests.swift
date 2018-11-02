//
//  UserTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

class UserTests: XCTestCase {

    var user: User!
    
    var fields: [String] {
        return ["firstName", "lastName", "username", "email", "password"]
    }
    var requiredFields: [String] {
        return fields.slice(start: 0, end: 3)
    }
    var optionalFields: [String] {
        return fields.filter { !requiredFields.contains($0) }
    }
    
    let data: [String : Any] = [
        "firstName" : "firstName",
        "lastName" : "lastName",
        "username" : "username",
        "email" : "email",
        "password" : "password",
    ]
    
    override func setUp() {
        user = User(name: (first: "firstName", last: "lastName"),
                username: "username",
                   email: "email",
                password: "password")
    }
    
    func testInitFromJSON() {
        for field in requiredFields {
            var temp = data
            temp.removeValue(forKey: field)
            
            XCTAssertNil(User(json: JSON(temp)))
        }
        
        for field in optionalFields {
            var temp = data
            temp.removeValue(forKey: field)
            
            XCTAssertNotNil(User(json: JSON(temp)))
        }
    }
    
    func testDictionaryFromUserData() {
        let result = User.from(name: (first: "firstName", last: "lastName"),
                           username: "username",
                              email: "email",
                           password: "password")

        fields.forEach { XCTAssertEqual(result[$0] as? String, $0) }
    }
    
    func testTransportable() {
        let result = user.transportable
        
        fields.forEach { XCTAssertEqual(result[$0] as? String, $0) }
    }
    
    func testFullName() {
        XCTAssertEqual(user.fullName, "firstName lastName")
    }
    
    override func tearDown() {
        user = nil
    }

}
