//
//  Calendar.swift
//  SacredCalendar
//
//  Created by Developer on 10/29/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit
import Cartography

class CalendarViewer: UIView {
    static let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    
    func show(events: [Event], mode: CalendarView) {
        clear()
        
        print("Displaying \(events.count) events")
        
        switch mode {
        case .monthly: showWeekly(events: events)
        case .weekly: showWeekly(events: events)
        case .daily: showDaily(events: events)
        }
    }
    
    private func clear() {
        subviews.forEach({ $0.removeFromSuperview() })
    }
    
    func showDaily(events: [Event]) {
        let dayView = DayView.create()
        
        for event in events {
            let eventView = EventView.create(event: event)
            dayView.eventsStackView.addArrangedSubview(eventView)
            
            constrain(eventView) {
                $0.height == 44
            }
        }
        
        addSubview(dayView)
        constrain(dayView, self) {
            $0.center == $1.center
            $0.size == $1.size
        }
    }
    
    func showWeekly(events: [Event]) {
        let today = Date()
        let todayComponents = Calendar.current.dateComponents([.weekdayOrdinal], from: today)
        
        var previous: DayView?
        let daySpread = 5
        for i in 0..<daySpread {
            let isLastDay = i == (daySpread - 1)
    
            let dateComponents = NSDateComponents()
            dateComponents.day = i - (todayComponents.weekday ?? 0) - 1
            let date = Calendar.current.date(byAdding: dateComponents as DateComponents, to: today)!
            
            let isToday = Calendar.current.compare(date, to: today, toGranularity: .day) == .orderedSame
            
            let components = Calendar.current.dateComponents([.day], from: date)
            
            let dayView = DayView.create(showSeparator: !isLastDay)
            dayView.dayOfWeekLabel.text = CalendarViewer.daysOfTheWeek[i]
            dayView.dayLabel.text = "\(components.day ?? 0)"
            
            if isToday {
                dayView.dayOfWeekLabel.font = dayView.dayOfWeekLabel.font.asBold()
                dayView.dayLabel.font = dayView.dayLabel.font.asBold()
            }
            
            addSubview(dayView)
            constrain(dayView, self) {
                $0.top == $1.top
                $0.bottom == $1.bottom
            }
            
            if let previous = previous {
                constrain(dayView, previous) {
                    $0.width == $1.width
                    $0.leading == $1.trailing
                }
                if isLastDay {
                    constrain(dayView, self) {
                        $0.trailing == $1.trailing
                    }
                }
            } else {
                constrain(dayView, self) {
                    $0.leading == $1.leading
                }
            }
            
            for event in events {
                let eventView = WeekEventView.create(event: event)
                dayView.eventsStackView.addArrangedSubview(eventView)
                
                constrain(eventView) {
                    $0.height == 30
                }
            }
            
            previous = dayView
        }
    }
}
