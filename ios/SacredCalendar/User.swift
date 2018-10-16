//
//  User.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Foundation

typealias TransportFormat = [String : Any]

protocol Transportable {
    var transportable: TransportFormat { get }
}

extension Sequence where Iterator.Element: Transportable {
    var transportables: [TransportFormat] {
        return self.map { $0.transportable }
    }
}

protocol JSONCreatable {
    init?(json: JSON)
}

extension JSONCreatable {
    static func create(from list: [JSON]) -> [Self]? {
        let attempt = list.compactMap(Self.init)
        return attempt.count == list.count ? attempt : nil
    }
}


protocol Model: JSONCreatable, Transportable {
    var id: String { get }
    
    init?(json: JSON)
    init?(id: String, json: JSON)
}

extension Model {
    init?(json: JSON) {
        guard let id = json["_id"].string else { return nil }
        self.init(id: id, json: json)
    }
}

class User: Model {
    let id: String
    
    let firstName: String
    let lastName: String
    
    let username: String
    
    var fullName: String {
        return "\(firstName) \(lastName)"
    }
    
    var transportable: TransportFormat {
        return [
            "firstName": firstName,
            "lastName": lastName,
            "username": username,
        ]
    }
    
    required init?(id: String, json: JSON) {
        guard let firstName = json["firstName"].string else { return nil }
        guard let lastName = json["lastName"].string else { return nil }
        guard let username = json["username"].string else { return nil }
        
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.username = username
    }
}
