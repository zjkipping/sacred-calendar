//
//  Environment.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

/// Container for configuration.
struct Configuration {
    static let environment = Bundle.main.infoDictionary!["API_BASE_URL"] as! String
}
