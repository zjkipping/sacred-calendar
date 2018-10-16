//
//  Category.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

struct Category: Model {
    let id: String
    let name: String
    
    var transportable: TransportFormat {
        return ["name": name]
    }
    
    init(name: String, id: String = UUID().uuidString) {
        self.name = name
        self.id = id
    }
    
    init?(id: String, json: JSON) {
        guard let name = json["name"].string else { return nil }
        
        self.id = id
        self.name = name
    }
}
