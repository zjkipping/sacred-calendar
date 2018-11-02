//
//  ExtensionTests.swift
//  SacredCalendarTests
//
//  Created by Developer on 11/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import XCTest
@testable import SacredCalendar

class ExtensionTests: XCTestCase {
    
    override func setUp() {
        
    }
    
    func testStringPathAppend() {
        XCTAssertEqual("domain".pathAppend("endpoint"), "domain/endpoint")
    }
    
    func testUIViewControllerSetTitle() {        
        let controller = UIViewController()
        controller.set(title: "title")
        
        XCTAssertEqual(controller.navigationItem.titleLabel.text, "title")
    }
    
    func testUIFontAsBold() {
        let font = UIFont(name: "Helvetica", size: 18)!
        let bold = font.asBold()!
        
        XCTAssertTrue(bold.fontName.contains(font.fontName))
        XCTAssertTrue(bold.fontName.lowercased().contains("bold"))
    }

    func testISO8601DateFormatter() {
        XCTAssertEqual(ISO8601DateFormatter.shared.formatOptions, [.withInternetDateTime, .withFractionalSeconds])
    }
    
    func testDateFromISOString() {
        XCTAssertNotNil(Date.from(isoString: "2018-11-02T04:32:35.000Z"))
        XCTAssertNil(Date.from(isoString: "2018-11-abcdef:35+00:00"))
    }
    
    func testDateFromDateString() {
        XCTAssertNotNil(Date.from(dateString: "2018-12-30"))
        XCTAssertNil(Date.from(dateString: "2018-not a date12-30"))
    }
    
    func testDateFromTimeString() {
        XCTAssertNotNil(Date.from(timeString: "12:30 AM"))
        XCTAssertNil(Date.from(timeString: "12:not a time30 AM"))
    }
    
    func testISOStringFromDate() {
        XCTAssertEqual(Date(timeIntervalSince1970: 0).isoString, "1970-01-01T00:00:00.000Z")
    }
    
    func testDateStringFromDate() {
        XCTAssertEqual(Date(timeIntervalSince1970: 0).dateString, "1969-12-31")
    }
    
    func testTimeStringFromDate() {
        XCTAssertEqual(Date(timeIntervalSince1970: 0).timeString, "06:00 PM")
    }

    override func tearDown() {

    }
}
