//
//  Model.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

typealias TransportFormat = [String : Any]

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
