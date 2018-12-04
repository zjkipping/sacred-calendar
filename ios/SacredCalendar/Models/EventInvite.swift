//
//  EventInvite.swift
//  SacredCalendar
//
//  Created by Developer on 12/2/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

/// Data model definition of a event invite
class EventInvite: Model {
    let id: Int
    
    let username: String
    let tag: String?
    let name: String
    let description: String?
    let location: String?
    let date: Date
    let startTime: Date
    let endTime: Date?
    let created: Date
    
    /// Transportable representation.
    var transportable: TransportFormat {
        return [:]
    }
    
    /// Creates an new instance from JSON. Fails if missing a required field.
    required init?(id: Int, json: JSON) {
        guard let username = json["username"].string else { return nil }
        guard let created = json["created"].double else { return nil }
        guard let name = json["name"].string else { return nil }
        guard let date = json["date"].double else { return nil }
        guard let startTime = json["startTime"].double else { return nil }

        self.id = id
        self.username = username
        self.tag = json["tag"].string
        self.created = Date(timeIntervalSince1970: created)
        self.name = name
        self.description = json["description"].string
        self.location = json["location"].string
        self.date = Date(timeIntervalSince1970: date)
        
        self.startTime = Date(timeIntervalSince1970: startTime)
        
        if let endTime = json["endTime"].double {
            self.endTime = Date(timeIntervalSince1970: endTime)
        } else {
            self.endTime = nil
        }
    }
}
