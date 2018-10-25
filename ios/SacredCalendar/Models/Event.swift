//
//  temp.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

class Event: Model {
    let id: String

    let date: Date
    var category: Category
    var startTime: Date
    var endTime: Date
    var description: String
    
    var transportable: TransportFormat {
        return [
            "date" : date.string,
            "category" : category.transportable,
            "startTime" : startTime.string,
            "endTime" : endTime.string,
            "description" : description,
        ]
    }
    
    init(date: Date, category: Category, id: String = UUID().uuidString, description:String, startTime: Date, endTime: Date) {
        self.date = date
        self.category = category
        self.id = id
        self.description = description
        self.startTime = startTime
        self.endTime = endTime
    }
    
    required init?(id: String, json: JSON) {
        guard let date = Date.from(isoString: json["date"].string) else { return nil }
        guard let categoryString = json["category"].string else { return nil }
        guard let description = json["description"].string else { return nil }
        guard let startTime = Date.from(isoString: json["startTime"].string) else { return nil }
        guard let endTime = Date.from(isoString: json["endTime"].string) else { return nil }
        
        self.id = id
        self.date = date
        self.category = Category(name: categoryString)
        self.description = description
        self.startTime = startTime
        self.endTime = endTime
    }
    
    func validate(startTime: Date, endTime: Date) -> Bool {
          if (startTime > endTime) {
               // Do something
               return false
          } else {
               return true
          }
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
    
    var string: String {
        return ISO8601DateFormatter.shared.string(from: self)
    }
}
