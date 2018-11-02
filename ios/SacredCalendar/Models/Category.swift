//
//  Category.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

/// Data model definition of a category
struct Category: Model {
    let id: Int
    let name: String
    let _color: String
    var color: UIColor {
        let index = _color.index(_color.startIndex, offsetBy: 1)

        let hex = _color[index...]
        if let hexNumber = Int(hex, radix: 16) {
            return UIColor(rgb: UInt32(hexNumber))
        } else {
            return .black
        }
    }
    
    /// Transportable representation.
    var transportable: TransportFormat {
        return ["name": name]
    }
    
    init(id: Int, name: String, color: String) {
        self.id = id
        self.name = name
        self._color = color
    }
    
    /// Creates an new instance from JSON. Fails if missing a required field.
    init?(id: Int, json: JSON) {
        guard let name = json["name"].string else { return nil }
        guard let color = json["color"].string else { return nil }

        self.id = id
        self.name = name
        self._color = color
    }
}
