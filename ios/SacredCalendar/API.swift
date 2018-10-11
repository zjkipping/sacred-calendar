//
//  API.swift
//  SacredCalendar
//
//  Created by Tristan Day on 10/9/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation
import Alamofire

class API {
     
     static let apiendpoint = "http://"
     
     static func request(resource: Resources, method: HTTPMethod, parameters: Parameters?, encoding: ParameterEncoding, headers: HTTPHeaders?) {
//          Alamofire.request(<#T##url: URLConvertible##URLConvertible#>, method: <#T##HTTPMethod#>, parameters: <#T##Parameters?#>, encoding: <#T##ParameterEncoding#>, headers: <#T##HTTPHeaders?#>)
     }
     
     enum Resources: String {
          case events, categories, users
     }
     
//     enum Actions {
//     }
}
