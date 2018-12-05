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

/// View modes for the calendar view.
enum CalendarView: Int {
    case monthly, weekly, daily
}

/// Container for the services required by the events view model logic container.
class EventsViewModelServices: HasFetchEventsService, HasDeleteEventService {
    let events: FetchEventsService
    let deleteEvent: DeleteEventService
    
    init(events: FetchEventsService = .init(), deleteEvent: DeleteEventService = .init()) {
        self.events = events
        self.deleteEvent = deleteEvent
    }
}

/// Logic container for the events view.
class EventsViewModel {
    typealias Services = HasFetchEventsService & HasDeleteEventService
    
    /// Contains the required async operations
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let userId: Int?
    
    var isOwnCalendar: Bool {
        return userId == nil
    }
    
    let events = BehaviorSubject<[Event]>(value: [])
    
    let trash = DisposeBag()
    
    init(services: Services = EventsViewModelServices(), userId: Int? = nil) {
        self.services = services
        self.userId = userId
    }
    
    /// Fetches events and pushes them to the events stream.
    func fetchEvents() {
        let observable: Observable<[Event]>
        if let id = userId {
            observable = services.events.executeFriendFetch(query: ["id" : id])
        } else {
            observable = services.events.execute()
        }
        observable
            .take(1)
            .bind(to: events)
            .disposed(by: trash)
    }
    
    /// Deletes the provided event. Returns a success flag.
    func delete(event: Event) -> Observable<Bool> {
        return services.deleteEvent.execute(id: event.id)
    }
}

/// Responsible for displaying the calendar view.
class EventsViewController: UIViewController {

    @IBOutlet weak var label: UILabel!
    
    @IBOutlet weak var calendarContainer: UIView!
    
    let viewModel: EventsViewModel
    
    let orientation = BehaviorSubject<Bool>(value: UIDevice.current.orientation.isPortrait)
    
    let trash = DisposeBag()
    
    let calendar = CalendarViewer()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: EventsViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "EventsViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // adds the calendar view to the display
        calendarContainer.addSubview(calendar)
        constrain(calendar, calendarContainer) {
            $0.center == $1.center
            $0.size == $1.size
        }
        
        // creates an observable combination of the events list and current orientation
        // for any changes to either, the events are sorted and displayed in the appropriate
        // calendar view mode
        let rerender = Observable.combineLatest(viewModel.events, orientation)
            .map({ args -> ([Event], CalendarView) in
                return (args.0, args.1 ? .daily : .weekly)
            })
            .map({ args -> ([Event], CalendarView) in
                let sorted = args.0.sorted { l, r in
                    l.startTime < r.startTime
                }
                return (sorted, args.1)
            })
    
        rerender
            .subscribe(onNext: { [weak self] data in
                self?.show(events: data.0, mode: data.1)
            }).disposed(by: trash)
       
        if viewModel.isOwnCalendar {
            setup(newEventButton: IconButton(type: .contactAdd))
            setup(accountButton: IconButton(title: "account"))
        }

        set(title: "Events")
        
        // observes the selected event property of the calendar for event deletion
        calendar.selectedEvent
            .subscribe(onNext: { [weak self] in
                guard let self = self else { return }
                let logic = EventViewModel(event: $0, isEventCreator: self.viewModel.isOwnCalendar)
                let controller = EventViewController(viewModel: logic)
                self.navigationController?.pushViewController(controller, animated: true)
            })
            .disposed(by: trash)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        // initiates a refresh of the events for the calendar view
        viewModel.fetchEvents()
    }
    
    /// Returns an observable modal confirming witht the user their intention to delete a given event.
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
    
    /// Adds the new event button to the view and observes it for taps to display the new event
    /// flow.
    func setup(newEventButton button: UIButton) {
        navigationItem.rightViews.append(button)
        
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let newEvent = NewEventViewController()
                self?.navigationController?.pushViewController(newEvent, animated: true)
            }).disposed(by: trash)
    }
    
    func setup(accountButton button: UIButton) {
        navigationItem.rightViews.append(button)
        
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let account = AccountViewController()
                self?.navigationController?.pushViewController(account, animated: true)
            })
            .disposed(by: trash)
    }
    
    /// Shows a given set of events in a desired view mode on the calendar.
    func show(events: [Event], mode: CalendarView) {
        calendar.show(events: events, mode: mode)
    }
    
    /// Delegate callback for when the orientation of the device changes.
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        // relays the current device orientation to an observable stream
        orientation.onNext(UIDevice.current.orientation.isPortrait)
    }
    
    /// Binds two CalendarView streams together.
    func bind(_ observer: PublishSubject<CalendarView>, to property: Observable<CalendarView>) {
        property.bind(to: observer).disposed(by: trash)
    }
    
    /// Binds a table view to an observable event stream.
    func bind(_ tableView: UITableView, to observable: Observable<[Event]>) {
        observable.bind(to: tableView.rx.items(cellIdentifier: "Cell")) { row, element, cell in
            cell.textLabel?.text = element.description
            cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
            cell.backgroundColor = .clear
        }.disposed(by: trash)
    }
}

/// Visual for representing a day in both the daily and weekly calendar views.
class DayView: UIView {
    @IBOutlet weak var dayLabel: UILabel!
    @IBOutlet weak var dayOfWeekLabel: UILabel!
    @IBOutlet weak var eventsStackView: UIStackView!
    
    @IBOutlet weak var shiftLeftButton: UIButton!
    @IBOutlet weak var shiftRightButton: UIButton!
    
    @IBOutlet weak var separator: UIView!
    
    /// Creates a new view day view
    class func create(showControls: Bool, showSeparator: Bool = false) -> DayView {
        let view = UINib(nibName: "DayView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! DayView
        view.shiftLeftButton.isHidden = !showControls
        view.shiftRightButton.isHidden = !showControls
        view.separator.isHidden = !showSeparator
        return view
    }
}

/// Visual for an event in the daily view of the calendar.
class EventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    let trash = DisposeBag()
    
    /// Sets the background color
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    /// Creates a new event view for a given event
    class func create(event: Event) -> EventView {
        let view = UINib(nibName: "EventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! EventView

        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        let startTime = formatter.string(from: event.startTime)
        
        view.nameLabel.text = "\(startTime) - \(event.name)"
        view.backgroundColor = event.category?.color
        return view
    }
}

/// Visual for an event in the week view of the calendar.
class WeekEventView: UIView {
    @IBOutlet weak var nameLabel: UILabel!
    
    @IBOutlet weak var shiftLeftButton: UIButton!
    @IBOutlet weak var shiftRightButton: UIButton!
    
    let trash = DisposeBag()
    
    /// Sets the background color
    var color: UIColor? {
        get { return backgroundColor }
        set { backgroundColor = newValue }
    }
    
    /// Creates a new event view for a given event
    class func create(event: Event) -> WeekEventView {
        let view = UINib(nibName: "WeekEventView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! WeekEventView
        view.nameLabel.text = event.name
        view.backgroundColor = event.category?.color
        return view
    }
}
