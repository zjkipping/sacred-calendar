//
//  Operators.swift
//  SacredCalendar
//
//  Created by Developer on 10/10/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

infix operator /

func / (left: String, right: String) -> String {
    return left.pathAppend(right)
}
