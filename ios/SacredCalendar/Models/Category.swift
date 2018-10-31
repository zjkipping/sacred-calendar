//
//  Category.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

struct Category: Model {
    let id: Int
    let name: String
    let color: String
    
    var transportable: TransportFormat {
        return ["name": name]
    }
    
    init(id: Int, name: String, color: String) {
        self.id = id
        self.name = name
        self.color = color
    }
    
    init?(id: Int, json: JSON) {
        guard let name = json["name"].string else { return nil }
        guard let color = json["color"].string else { return nil }

        self.id = id
        self.name = name
        self.color = color
    }
}
