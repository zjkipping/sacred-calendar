//
//  AvailableFriend.swift
//  SacredCalendar
//
//  Created by Developer on 12/4/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

/// Data model definition of a available friend
class AvailableFriend: Model, Friend {
    let id: Int
    
    var hashValue: Int {
        return id
    }
    
    let username: String
    
    /// Transportable representation.
    var transportable: TransportFormat {
        return [:]
    }
    
    /// Creates an new instance from JSON. Fails if missing a required field.
    required init?(id: Int, json: JSON) {
        guard let username = json["username"].string else { return nil }
        
        self.id = id
        self.username = username
    }
}
