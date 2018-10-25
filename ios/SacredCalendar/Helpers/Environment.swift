//
//  Environment.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

struct Configuration {
    #if DEBUG
    enum Environment: String {
        case production = "<production_api_url>"
        case development = "localhost"
    }
    static let environment = Environment.development.rawValue
    #else
    static let environment = Bundle.main.infoDictionary!["API_BASE_URL"] as! String
    #endif
}
