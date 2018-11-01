//
//  Calendar.swift
//  SacredCalendar
//
//  Created by Developer on 10/29/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Cartography
import RxCocoa
import RxSwift
import UIKit

class CalendarViewer: UIView {
    static let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    
    let trash = DisposeBag()
    
    var rerenderTrash = DisposeBag()
    
    let selectedEvent = PublishSubject<Event>()
    
    let targetDate = BehaviorSubject<Date>(value: Date())
    
    @IBOutlet weak var shiftLeftButton: UIButton!
    @IBOutlet weak var shiftRightButton: UIButton!

    func show(events: [Event], mode: CalendarView) {
        clear()
        
        switch mode {
        case .monthly: showWeekly(events: events)
        case .weekly: showWeekly(events: events)
        case .daily: showDaily(events: events)
        }
    }
    
    private func clear() {
        subviews.forEach({ $0.removeFromSuperview() })
        rerenderTrash = DisposeBag()
    }
    
    func showDaily(events: [Event]) {
        let date = try! targetDate.value()
        
        let dayView = DayView.create(showControls: true)
        
        let components = Calendar.current.dateComponents([.day, .weekday], from: date)
        dayView.dayOfWeekLabel.text = CalendarViewer.daysOfTheWeek[components.weekday! - 1]
        dayView.dayLabel.text = "\(components.day ?? 0)"
        
        let todaysEvents = events.filter {
            Calendar.current.compare($0.date, to: date, toGranularity: .day) == .orderedSame
        }
        
        for event in todaysEvents {
            let eventView = EventView.create(event: event)
            
            let longPress = UILongPressGestureRecognizer()
            eventView.addGestureRecognizer(longPress)
            
            longPress.rx.event
                .filter({ $0.state == .began })
                .withLatestFrom(Observable.just(event))
                .bind(to: selectedEvent)
                .disposed(by: rerenderTrash)
            
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
        
        let dateChanged: Observable<Date> = Observable.merge(dayView.shiftLeftButton.rx.tap.map({-1}), dayView.shiftRightButton.rx.tap.map({1}))
            .withLatestFrom(targetDate) { ($0, $1) }
            .map({
                let components = NSDateComponents()
                components.day = $0
                return Calendar.current.date(byAdding: components as DateComponents, to: $1)!
            })
            .filter({ $0 != nil })
            .map({ $0! })
            
        dateChanged
            .bind(to: targetDate)
            .disposed(by: rerenderTrash)
        dateChanged
            .subscribe(onNext: { [weak self] _ in
                self?.showDaily(events: events)
            })
            .disposed(by: rerenderTrash)
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
            
            let components = Calendar.current.dateComponents([.day, .weekday], from: date)
            
            let dayView = DayView.create(showControls: false, showSeparator: !isLastDay)
            dayView.dayOfWeekLabel.text = CalendarViewer.daysOfTheWeek[components.weekday! - 1]
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
            
            let todaysEvents = events.filter {
                Calendar.current.compare($0.date, to: date, toGranularity: .day) == .orderedSame
            }
            
            for event in todaysEvents {
                let eventView = WeekEventView.create(event: event)
                dayView.eventsStackView.addArrangedSubview(eventView)
                
                let longPress = UILongPressGestureRecognizer()
                eventView.addGestureRecognizer(longPress)
                
                longPress.rx.event
                    .filter({ $0.state == .began })
                    .withLatestFrom(Observable.just(event))
                    .bind(to: selectedEvent)
                    .disposed(by: rerenderTrash)
            
                constrain(eventView) {
                    $0.height == 30
                }
            }
            
            previous = dayView
        }
    }
}
