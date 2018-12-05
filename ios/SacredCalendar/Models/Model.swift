//
//  Model.swift
//  SacredCalendar
//
//  Created by Developer on 10/21/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

typealias TransportFormat = [String : Any]

/// Defines the interface for a Model type.
protocol Model: JSONCreatable, Transportable, Hashable {
    var id: Int { get }
    
    init?(json: JSON)
    init?(id: Int, json: JSON)
}

/// Default implementation of enforced Model constraints.
extension Model {
    init?(json: JSON) {
//        guard let id = json["id"].int else { return nil }
        let id = json["id"].int ?? 0
        self.init(id: id, json: json)
    }
    
    var hashValue: Int {
        return id
    }
}

/// Designates a type as being convertable to the TransportFormat.
protocol Transportable {
    var transportable: TransportFormat { get }
}

extension Sequence where Iterator.Element: Transportable {
    /// Adds Transportable property to a sequence of Transportables.
    var transportables: [TransportFormat] {
        return self.map { $0.transportable }
    }
}

/// Designates a type as being able to be created from a JSON representation.
protocol JSONCreatable {
    init?(json: JSON)
}

/// Default implementation of enforced JSONCreatable constraints.
extension JSONCreatable {
    /// Adds ability to create a list objects of a given type from JSON representations. If one item in the list fails to be created from JSON, the function returns nil.
    static func create(from list: [JSON]) -> [Self]? {
        let attempt = list.compactMap(Self.init)
        return attempt.count == list.count ? attempt : nil
    }
}

func ==<T: Model>(lhs: T, rhs: T) -> Bool {
    return lhs.id == rhs.id
}
