//
//  temp.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

/// Data model definition of an event
class Event: Model {
    let id: Int

    let name: String
    let date: Date
    var category: Category?
    var startTime: Date
    var endTime: Date?
    var description: String?
    
    /// Transportable representation.
    var transportable: TransportFormat {
        var data: TransportFormat = [
            "date" : date.timeIntervalSince1970,
            "startTime" : startTime.timeIntervalSince1970,
        ]
        
        if let description = description {
            data["description"] = description
        }
        if let category = category?.transportable {
            data["category"] = category
        }
        if let endTime = endTime?.timeIntervalSince1970 {
            data["endTime"] = endTime
        }
        return data
    }
    
    /// Creates an new instance from JSON. Fails if missing a required field.
    required init?(id: Int, json: JSON) {
        
        guard let name = json["name"].string else { return nil }
        guard let date = json["date"].double else { return nil }
        guard let startTime = json["startTime"].double else { return nil }
        
        self.id = id
        self.name = name
        self.date = Date(timeIntervalSince1970: date)
        self.category = Category(json: json["category"])
        self.startTime = Date(timeIntervalSince1970: startTime)
        
        if let description = json["description"].string {
            self.description = description
        }
        
        if let endTime = json["endTime"].double {
            self.endTime = Date(timeIntervalSince1970: endTime)
        }
    }
    
    /// Validates event start and end time.
    func validate(startTime: Date, endTime: Date) -> Bool {
          if (startTime > endTime) {
               return false
          } else {
               return true
          }
     }
}
