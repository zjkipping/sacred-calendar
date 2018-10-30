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
