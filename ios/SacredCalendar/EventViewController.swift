//
//  EventViewController.swift
//  SacredCalendar
//
//  Created by Developer on 12/2/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import Cartography
import Material
import RxCocoa
import RxSwift

/// Container for the services required by the events view model logic container.
class EventViewModelServices: HasDeleteEventService {
    let deleteEvent: DeleteEventService
    
    init(deleteEvent: DeleteEventService) {
        self.deleteEvent = deleteEvent
    }
}

/// Logic container for the events view.
class EventViewModel {
    typealias Services = HasDeleteEventService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    let event: Event
    
    init(services: Services = EventsViewModelServices(), event: Event) {
        self.services = services
        self.event = event
    }
    
    func deleteEvent() -> Observable<Bool> {
        return services.deleteEvent.execute(id: event.id)
    }
}

/// Responsible for displaying the calendar view.
class EventViewController: UIViewController {
    
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!
    
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var startTimeLabel: UILabel!
    @IBOutlet weak var endTimeLabel: UILabel!
    
    @IBOutlet weak var categoryLabel: UILabel!
    
    @IBOutlet weak var deleteButton: UIButton!
    
    let viewModel: EventViewModel
    
    let trash = DisposeBag()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: EventViewModel) {
        self.viewModel = viewModel
        
        super.init(nibName: "EventViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Event")
        
        setup(deleteButton: deleteButton)
        
        populateUI(event: viewModel.event)
    }
    
    func populateUI(event: Event) {
        nameLabel.text = event.name
        descriptionLabel.text = event.description
        locationLabel.text = event.location
        categoryLabel.text = event.category?.name
        
        let formatter = DateFormatter()
        formatter.dateFormat = "M/d/YYYY"
        
        dateLabel.text = formatter.string(from: event.date)
        
        formatter.dateFormat = "h:mm a"
        
        startTimeLabel.text = formatter.string(from: event.startTime)
        
        if let endTime = event.endTime {
            endTimeLabel.text = formatter.string(from: endTime)
        } else {
            endTimeLabel.text = nil
        }
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
    
    func setup(deleteButton button: UIButton) {
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let friends = FriendsListViewController()
                self?.navigationController?.pushViewController(friends, animated: true)
            })
            .disposed(by: trash)
    }
}