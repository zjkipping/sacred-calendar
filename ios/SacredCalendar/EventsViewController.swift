//
//  EventsViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import Cartography
import Material
import RxCocoa
import RxSwift

enum CalendarView: Int {
    case monthly, weekly, daily
}

class EventsViewModelServices: HasFetchEventsService, HasDeleteEventService {
    let events: FetchEventsService
    let deleteEvent: DeleteEventService
    
    init(events: FetchEventsService = .init(), deleteEvent: DeleteEventService = .init()) {
        self.events = events
        self.deleteEvent = deleteEvent
    }
}

class EventsViewModel {
    typealias Services = HasFetchEventsService & HasDeleteEventService
    
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let events = BehaviorSubject<[Event]>(value: [])
    
    let trash = DisposeBag()
    
    init(services: Services = EventsViewModelServices()) {
        self.services = services
    }
    
    func fetchEvents(query: [String : Any]) -> Observable<[Event]> {
        let newEvents = services.events.execute(query: query)
        newEvents.bind(to: events).disposed(by: trash)
        return newEvents
    }
    
    func delete(event: Event) -> Observable<Bool> {
        return services.deleteEvent.execute(id: event.id)
    }
}

class EventsViewController: UIViewController {

    @IBOutlet weak var label: UILabel!
    
    @IBOutlet weak var calendarContainer: UIView!
    
    let viewModel: EventsViewModel
    
    let orientation = BehaviorSubject<Bool>(value: UIDevice.current.orientation.isPortrait)
    
    let trash = DisposeBag()
    
    let calendar = CalendarViewer()
    
    init(viewModel: EventsViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "EventsViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        calendarContainer.addSubview(calendar)
        constrain(calendar, calendarContainer) {
            $0.center == $1.center
            $0.size == $1.size
        }
        
        let rerender = Observable.combineLatest(viewModel.events, orientation)
            .map({ args -> ([Event], CalendarView) in
                return (args.0, args.1 ? .daily : .weekly)
            })
            .map({ args -> ([Event], CalendarView) in
                
                let sorted: [Event] = args.0.sorted {
                    if $0.startTime.contains("am") && !$1.startTime.contains("am") {
                        return true
                    } else if !$0.startTime.contains("am") && $1.startTime.contains("am") {
                        return false
                    } else {
                        return $0.startTime < $1.startTime
                    }
                }
                return (sorted, args.1)
            })
        
        rerender
            .subscribe(onNext: { [weak self] data in
                self?.show(events: data.0, mode: data.1)
            }).disposed(by: trash)
       
        setup(newEventButton: IconButton(type: .contactAdd))
        
        set(title: "Events")
    }
    
    override func viewWillAppear(_ animated: Bool) {
        show(events: [], mode: .daily)
        
        _ = viewModel.fetchEvents(query: [:])
        
        calendar.selectedEvent
            .flatMap({ [weak self] in
                self?.proposeDelete(event: $0) ?? .empty()
            })
            .flatMap({ [weak self] in
                self?.viewModel.delete(event: $0) ?? .empty()
            })
            .flatMap({ [weak self] _ in
                self?.viewModel.fetchEvents(query: [:]) ?? .empty()
            })
            .subscribe(onNext: { _ in
                print("deletion success")
            })
            .disposed(by: trash)
    }
    
    func proposeDelete(event: Event) -> Observable<Event> {
        return Observable.create { observer in
            let alert = UIAlertController(title: "Delete Event", message: "Are you sure you want to delete this event?", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "cancel", style: .cancel) { _ in
                observer.onCompleted()
            })
            alert.addAction(UIAlertAction(title: "delete", style: .destructive) { _ in
                observer.onNext(event)
                observer.onCompleted()
            })
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
    
    func setup(newEventButton button: UIButton) {
        navigationItem.rightViews.append(button)
        
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let newEvent = NewEventViewController()
                self?.navigationController?.pushViewController(newEvent, animated: true)
            }).disposed(by: trash)
    }
    
    func show(events: [Event], mode: CalendarView) {
        calendar.show(events: events, mode: mode)
    }
    
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        orientation.onNext(UIDevice.current.orientation.isPortrait)
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
    
    @IBOutlet weak var shiftLeftButton: UIButton!
    @IBOutlet weak var shiftRightButton: UIButton!
    
    @IBOutlet weak var separator: UIView!
    
    class func create(showControls: Bool, showSeparator: Bool = false) -> DayView {
        let view = UINib(nibName: "DayView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! DayView
        view.shiftLeftButton.isHidden = !showControls
        view.shiftRightButton.isHidden = !showControls
        view.separator.isHidden = !showSeparator
        return view
    }
}

class EventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    let trash = DisposeBag()
    
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    class func create(event: Event) -> EventView {
        let view = UINib(nibName: "EventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! EventView
    
//        let components = Calendar.current.dateComponents([.hour, .minute], from: event.startTime)
//        let hour = components.hour!
//        let minute = components.minute!
//        let period = hour < 12 ? "am" : "pm"
//
//
//        let adjustment = NSDateComponents()
//        adjustment.hour = 0
//
//        let adjusted = Calendar.current.date(byAdding: adjustment as DateComponents, to: event.startTime)!
        
//        let hourString = String(format: "%02d", hour > 12 ? hour - 12 : hour)
//        let minuteString = String(format: "%02d", minute)
//        view.nameLabel.text = "\(hourString):\(minuteString) \(period) - \(event.name)"
//        view.nameLabel.text = "\(adjusted.timeString) - \(event.name)"
        view.nameLabel.text = "\(event.startTime.lowercased()) - \(event.name)"
        view.backgroundColor = event.category?.color
        return view
    }
}

class WeekEventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    @IBOutlet weak var shiftLeftButton: UIButton!
    @IBOutlet weak var shiftRightButton: UIButton!
    
    let trash = DisposeBag()
    
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    class func create(event: Event) -> WeekEventView {
        let view = UINib(nibName: "WeekEventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! WeekEventView
        view.nameLabel.text = event.name
        view.backgroundColor = event.category?.color
        return view
    }
}
