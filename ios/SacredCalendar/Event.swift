//
//  temp.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

class Event {
     let date: Date
     var category: Category
     let id: String
     var startTime: Date
     var endTime: Date
     var description: String
     init(date: Date, category: Category, id: String = UUID().uuidString, description:String, startTime: Date, endTime: Date) {
          self.date = date
          self.category = category
          self.id = id
          self.description = description
          self.startTime = startTime
          self.endTime = endTime
     }
     
     
     // let timeStamp = Date()
     struct Category {
          let id: String
          let name: String
          
          init(name: String, id: String = UUID().uuidString) {
               self.name = name
               self.id = id
          }
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
