//
//  Friendship.swift
//  Alamofire
//
//  Created by Developer on 12/1/18.
//

/// Data model definition of a friendship
class Friendship: Model {
    let id: Int
    
    let username: String
    let tag: String?
    let privacyType: Int
    
    /// Transportable representation.
    var transportable: TransportFormat {
        return [:]
    }
    
    /// Creates an new instance from JSON. Fails if missing a required field.
    required init?(id: Int, json: JSON) {
        guard let username = json["username"].string else { return nil }
        guard let privacyType = json["privacyType"].int else { return nil }
        
        self.id = id
        self.tag = json["tag"].string
        self.username = username
        self.privacyType = privacyType
    }
}
