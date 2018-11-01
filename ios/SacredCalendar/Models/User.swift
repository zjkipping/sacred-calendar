//
//  User.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

class User: Model {
    typealias Name = (first: String, last: String)
    
    static var current: User!
    
    let id: Int
    
    let name: Name
    
    let username: String
    let password: String

    let email: String
    
    var fullName: String {
        return "\(name.first) \(name.last)"
    }
    
    var transportable: TransportFormat {
        return [
            "firstName": name.first,
            "lastName": name.last,
            "username": username,
            "email": email,
            "password": password,
        ]
    }
    
    init(name: Name, username: String, email: String, password: String) {
        self.id = 0
        self.name = name
        self.username = username
        self.email = email
        self.password = password
    }
    
    required init?(id: Int, json: JSON) {
        guard let firstName = json["firstName"].string else { return nil }
        guard let lastName = json["lastName"].string else { return nil }
        guard let username = json["username"].string else { return nil }
        guard let email = json["email"].string else { return nil }
    
        self.id = id
        self.name = (first: firstName, last: lastName)
        self.username = username
        self.email = email
        self.password = ""
    }
    
    static func from(name: Name, username: String, email: String, password: String) -> TransportFormat {
        return User(name: name, username: username, email: email, password: password).transportable
    }
}
