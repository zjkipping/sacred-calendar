//
//  EventsViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import RxCocoa
import RxSwift

class EventsViewModelServices: HasFetchEventsService {
    let events: FetchEventsService
    
    init(events: FetchEventsService = .init()) {
        self.events = events
    }
}

class EventsViewModel {
    typealias Services = HasFetchEventsService
    
    let services: Services
    
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

    @IBOutlet weak var tableView: UITableView!
    
    let viewModel: EventsViewModel
    
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
        
        bind(tableView, to: viewModel.events)
        
        fetchEvents()
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
