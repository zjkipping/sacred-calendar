//
//  temp.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

class Event: Model {
    let id: Int

    let name: String
    let date: Date
    var category: Category?
    var startTime: String
    var endTime: String
    var description: String
    
    var transportable: TransportFormat {
        var data: TransportFormat = [
            "date" : date.dateString,
            "startTime" : startTime,
            "endTime" : endTime,
            "description" : description,
        ]
        if let category = category?.transportable {
            data["category"] = category
        }
        return data
    }
    
    init(name: String, date: Date, category: Category, id: Int, description:String, startTime: Date, endTime: Date) {
        self.name = name
        self.date = date
        self.category = category
        self.id = id
        self.description = description
        self.startTime = startTime.timeString
        self.endTime = endTime.timeString
    }
    
    required init?(id: Int, json: JSON) {
        guard let name = json["name"].string else { return nil }
        guard let date = Date.from(dateString: json["date"].string) else { return nil }
        let description = json["description"].string ?? ""
        guard let startTime = Date.from(timeString: json["startTime"].string) else { return nil }
        let endTime = Date.from(timeString: json["endTime"].string) ?? Date()
        
        self.id = id
        self.name = name
        self.date = date
        self.category = Category(json: json["category"])
        self.description = description
        self.startTime = json["startTime"].string ?? ""
        self.endTime = json["endTime"].string ?? ""
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
