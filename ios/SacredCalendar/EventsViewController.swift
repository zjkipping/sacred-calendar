//
//  EventsViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import Cartography
import JTAppleCalendar
import RxCocoa
import RxSwift

enum CalendarView: Int {
    case monthly, weekly, daily
}

class EventsViewModelServices: HasFetchEventsService {
    let events: FetchEventsService
    
    init(events: FetchEventsService = .init()) {
        self.events = events
    }
}

class EventsViewModel {
    typealias Services = HasFetchEventsService
    
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let events = PublishSubject<[Event]>()
    
    let trash = DisposeBag()
    
    init(services: Services = EventsViewModelServices()) {
        self.services = services
    }
    
    func fetchEvents(query: [String : Any]) -> Observable<[Event]> {
        let newEvents = services.events.execute(query: query)
        newEvents.take(1).bind(to: events).disposed(by: trash)
        return newEvents
    }
}

class EventsViewController: UIViewController {

    @IBOutlet weak var modeSwitcher: UISegmentedControl!
    @IBOutlet weak var label: UILabel!
    
    @IBOutlet weak var calendarContainer: UIView!

    let viewModel: EventsViewModel
    
    let orientation = PublishSubject<Bool>()
    
    let trash = DisposeBag()
    
    init(viewModel: EventsViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "EventsViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let currentMode = modeSwitcher.rx.selectedSegmentIndex.map({CalendarView(rawValue: $0)!})
        bind(viewModel.viewMode, to: currentMode)
        
        Observable.combineLatest(viewModel.events, orientation)
            .map({ ($0, $1 ? .daily : .weekly) })
            .subscribe(onNext: { [weak self] in
                self?.show(events: $0, mode: $1)
            })
            .disposed(by: trash)
        
        
        
        
        let events = [
            (Category(name: "something"), "Birthday", Date(), Date().addingTimeInterval(60*60)),
            (Category(name: "something"), "Birthday", Date(), Date().addingTimeInterval(60*60)),
            (Category(name: "something"), "Birthday", Date(), Date().addingTimeInterval(60*60)),
            ].map {
                Event(date: Date(), category: $0, description: $1, startTime: $2, endTime: $3)
        }
        
        viewModel.events.onNext(events)
        
        
        
        
                
        viewModel.viewMode
            .map({
                switch $0 {
                case .daily: return "daily"
                case .weekly: return "weekly"
                case .monthly: return "monthly"
                }
            })
            .bind(to: label.rx.text)
            .disposed(by: trash)
        
//        fetchEvents()
    }
    
    func clearCalendarView() {
        calendarContainer.subviews.forEach({ $0.removeFromSuperview() })
    }
    
    func show(events: [Event], mode: CalendarView) {
        clearCalendarView()
        
        print("Displaying \(events.count) events")
        
        switch mode {
        case .monthly: showWeekly(events: events)
        case .weekly: showWeekly(events: events)
        case .daily: showDaily(events: events)
        }
    }
    
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        orientation.onNext(UIDevice.current.orientation.isPortrait)
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
        
        calendarContainer.addSubview(dayView)
        constrain(dayView, calendarContainer) {
            $0.center == $1.center
            $0.size == $1.size
        }
    }
    
    func showWeekly(events: [Event]) {
        let today = Date()
        let todayComponents = Calendar.current.dateComponents([.weekdayOrdinal], from: today)
        
        let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        var previous: DayView?
        let daySpread = 5
        for i in 0..<daySpread {
            let isLastDay = i == (daySpread - 1)
            
            let dateComponents = NSDateComponents()
            dateComponents.day = i - (todayComponents.weekday ?? 0) - 1
            let date = Calendar.current.date(byAdding: dateComponents as DateComponents, to: today)!
            
            let components = Calendar.current.dateComponents([.day], from: date)
            
            let dayView = DayView.create(showSeparator: true)
            dayView.dayOfWeekLabel.text = daysOfTheWeek[i]
            dayView.dayLabel.text = "\(components.day ?? 0)"
            
            calendarContainer.addSubview(dayView)
            constrain(dayView, calendarContainer) {
                $0.top == $1.top
                $0.bottom == $1.bottom
            }
            
            if let previous = previous {
                constrain(dayView, previous) {
                    $0.width == $1.width
                    $0.leading == $1.trailing
                }
                if isLastDay {
                    constrain(dayView, calendarContainer) {
                        $0.trailing == $1.trailing
                    }
                }
            } else {
                constrain(dayView, calendarContainer) {
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
    
    func bind(_ observer: PublishSubject<CalendarView>, to property: Observable<CalendarView>) {
        property.bind(to: observer).disposed(by: trash)
    }
    
    func bind(_ tableView: UITableView, to observable: Observable<[Event]>) {
        observable.bind(to: tableView.rx.items(cellIdentifier: "Cell")) { row, element, cell in
            cell.textLabel?.text = element.description
            cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
            cell.backgroundColor = .clear
        }.disposed(by: trash)
    }
    
    func fetchEvents() {
        Observable.just(User.current.id)
            .map({ ["userId" : $0] })
            .flatMap({ [weak self] in
                self?.viewModel.fetchEvents(query: $0) ?? .empty()
            })
            .subscribe()
            .disposed(by: trash)
    }
}

class DayViewCell: UIView {
    @IBOutlet weak var dayLabel: UILabel!
    @IBOutlet weak var dayOfWeekLabel: UILabel!
    
    class func create() -> DayViewCell {
        return UINib(nibName: "DayViewCell", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! DayViewCell
    }
}

class DayView: UIView {
    @IBOutlet weak var dayLabel: UILabel!
    @IBOutlet weak var dayOfWeekLabel: UILabel!
    @IBOutlet weak var eventsStackView: UIStackView!
    
    @IBOutlet weak var separator: UIView!
    
    class func create(showSeparator: Bool = false) -> DayView {
        let view = UINib(nibName: "DayView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! DayView
        view.separator.isHidden = !showSeparator
        return view
    }
}

class EventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    class func create(event: Event) -> EventView {
        let view = UINib(nibName: "EventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! EventView
        
        let components = Calendar.current.dateComponents([.hour, .minute], from: event.startTime)
        let hour = components.hour!
        let minute = components.minute!
        let period = hour < 12 ? "am" : "pm"
        
        let hourString = String(format: "%02d", hour > 12 ? hour - 12 : hour)
        let minuteString = String(format: "%02d", minute)
        view.nameLabel.text = "\(hourString):\(minuteString) \(period) - \(event.description)"
        
        view.color = .blue
        return view
    }
}

class WeekEventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    class func create(event: Event) -> WeekEventView {
        let view = UINib(nibName: "WeekEventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! WeekEventView
        view.nameLabel.text = event.description
        view.color = .blue
        return view
    }
}
