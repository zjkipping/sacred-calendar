//
//  Extensions.swift
//  SacredCalendar
//
//  Created by Developer on 10/10/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

extension String {
    func pathAppend(_ value: String) -> String {
        return self + "/" + value
    }
}

extension UIViewController {
    func set(title: String) {
        navigationItem.titleLabel.text = title
    }
}

extension UIFont {
    func asBold() -> UIFont? {
        for fontName in UIFont.fontNames(forFamilyName: familyName) {
            if let _ = fontName.range(of: "bold", options: .caseInsensitive) {
                return UIFont(name: fontName, size: pointSize)
            }
        }
        return nil
    }
}

extension ISO8601DateFormatter {
    static let shared: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}

extension Date {
    
    static func from(isoString: String? = nil) -> Date? {
        guard let string = isoString else { return nil }
        return ISO8601DateFormatter.shared.date(from: string)
    }
    
    static func from(dateString: String? = nil) -> Date? {
        guard let string = dateString else { return nil }
        let formatter = DateFormatter()
        formatter.dateFormat = "YYYY-MM-dd"
        return formatter.date(from: string)
    }
    
    static func from(timeString: String? = nil) -> Date? {
        guard let string = timeString else { return nil }
        let formatter = DateFormatter()
        formatter.amSymbol = "AM"
        formatter.pmSymbol = "PM"
        formatter.dateFormat = "HH:mm a"
        return formatter.date(from: string)
    }
    
    var isoString: String {
        return ISO8601DateFormatter.shared.string(from: self)
    }
    
    var dateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }
    
    var timeString: String {
        let formatter = DateFormatter()
        formatter.amSymbol = "AM"
        formatter.pmSymbol = "PM"
        formatter.dateFormat = "hh:mm a"
        return formatter.string(from: self)
    }
}
