//
//  ValidatedResponse.swift
//  SacredCalendar
//
//  Created by Developer on 10/10/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Alamofire

class ValidatedResponse {
    let raw: DataResponse<Any>
    let statusCode: Int
    let data: JSON
    
    var success: Bool {
        guard let statusCode = raw.response?.statusCode else { return false }
        return (200..<300).contains(statusCode)
    }
    
    var error: NSError? {
        return raw.error as? NSError
    }
    
    init(raw: DataResponse<Any>, statusCode: Int, data: JSON) {
        self.raw = raw
        self.statusCode = statusCode
        self.data = data
    }
}
