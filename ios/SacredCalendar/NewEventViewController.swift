//
//  NewEventViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/29/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import Cartography
import MaterialComponents
import RxCocoa
import RxSwift

class NewEventViewModelServices: HasCreateEventService {
    let events: CreateEventService
    
    init(events: CreateEventService = .init()) {
        self.events = events
    }
}

class NewEventViewModel {
    typealias Services = HasCreateEventService
    
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let events = PublishSubject<[Event]>()
    
    let trash = DisposeBag()
    
    init(services: Services = NewEventViewModelServices()) {
        self.services = services
    }
    
    func submit(data: [String : Any]) -> Observable<Bool> {
        return services.events.execute(data: data)
    }
}

class NewEventViewController: UIViewController {
    enum EventTime {
        case start, end
    }
    
    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var descriptionField: UITextField!
    @IBOutlet weak var locationField: UITextField!
    
    @IBOutlet weak var editStartTimeButton: UIButton!
    @IBOutlet weak var editEndTimeButton: UIButton!
    
    @IBOutlet weak var submitButton: UIButton!
    @IBOutlet weak var cancelButton: UIButton!
    
    @IBOutlet weak var startDateLabel: UILabel!
    @IBOutlet weak var endDateLabel: UILabel!
    
    let startDate = BehaviorSubject<Date>(value: Date())
    let endDate = BehaviorSubject<Date>(value: Date())
    
    let viewModel: NewEventViewModel
    
    let trash = DisposeBag()
    
    let formErrors = PublishSubject<[String]>()
    
    init(viewModel: NewEventViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "NewEventViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "New Event")
        
        setup(submitButton: submitButton)
        setup(cancelButton: cancelButton)
        
        setup(editTimeButton: editStartTimeButton, time: .start)
        setup(editTimeButton: editEndTimeButton, time: .end)
        
        bind(observable: formated(date: startDate), to: startDateLabel.rx.text)
        bind(observable: formated(date: endDate), to: endDateLabel.rx.text)
        
        formErrors.subscribe(onNext: {
            print($0)
        }).disposed(by: trash)
    }
    
    func formated(date: Observable<Date>) -> Observable<String> {
        return date.map({ $0.timeString })
    }
    
    func bind(observable: Observable<String>, to property: Binder<String?>) {
        observable.bind(to: property).disposed(by: trash)
    }
    
    func showDatePicker(date: Date?) -> Observable<Date> {
        let container = UIView()
        container.backgroundColor = .darkGray
        
        let picker = UIDatePicker()
        picker.date = date ?? Date()
        
        let done = MDCRaisedButton()
        done.setTitle("DONE", for: .normal)
        done.setTitleColor(.white, for: .normal)
        done.setBackgroundColor(.blue, for: .normal)
        
        container.addSubview(done)
        container.addSubview(picker)
        constrain(picker, done, container) {
            $1.height == 44
            $1.centerX == $2.centerX
            
            $0.top == $2.top
            $0.bottom == $1.top
            $1.bottom == $2.bottom
        }
        
        view.addSubview(container)
        constrain(container, view) {
            $0.center == $1.center
            $0.width == $1.width
        }
        
        return done.rx.tap
                    .withLatestFrom(picker.rx.date)
                    .take(1)
                    .do(onCompleted: container.removeFromSuperview)
    }
    
    func setup(editTimeButton button: UIButton, time: EventTime) {
        let dateOption = time == .start ? startDate : endDate
        
        button.rx.tap
            .withLatestFrom(dateOption)
            .flatMap({ [weak self] in
                self?.showDatePicker(date: $0) ?? .empty()
            })
            .bind(to: dateOption)
            .disposed(by: trash)
    }
    
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            nameField.rx.text.orEmpty,
            descriptionField.rx.text.orEmpty,
            locationField.rx.text.orEmpty,
            startDate,
            endDate
        )
        
//        const description = req.body.description ? req.body.description: null;
//        const location = req.body.location ? req.body.location : null;
//        const endTime = req.body.endTime ? req.body.endTime: null;
        
        button.rx.tap
            .withLatestFrom(form)
            .filter({ [weak self] in
                guard let self = self else { return false }
                _ = $3
                _ = $4
                
                switch self.validateForm(name: $0, description: $1, location: $2) {
                case .valid: return true
                case .invalid(let reasons):
                    self.formErrors.onNext(reasons)
                    return false
                }
            }).map({[
                "name" : $0,
                "description" : $1,
                "location" : $2,
                "date" : $3.dateString,
                "startTime" : $3.timeString,
                "endTime" : $4.timeString,
            ]}).flatMap({ [weak self] in
                self?.viewModel.submit(data: $0) ?? .empty()
            }).subscribe(onNext: { _ in
                print("success")
            }).disposed(by: trash)
    }
    
    func setup(cancelButton button: UIButton) {
        button.rx.tap
            .flatMap({ [weak self] in
                self?.showCancelFormConfirmation() ?? .empty()
            })
            .filter({ $0 })
            .subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
            }).disposed(by: trash)
    }
    
    func validateForm(name: String, description: String, location: String) -> FormValidationState {
        var messages: [String] = []
        
        if !FormValidator.validate(name: name) {
            messages.append("name required")
        }
        
        if !FormValidator.validate(description: description) {
            messages.append("description required")
        }
        
        if !FormValidator.validate(location: location) {
            messages.append("location required")
        }
        
        return messages.isEmpty ? .valid : .invalid(reasons: messages)
    }
    
    func showCancelFormConfirmation() -> Observable<Bool> {
        return Observable.create { observer in
            let alert = UIAlertController(title: "Discard Event?", message: "Are you sure you want to discard this event?", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "cancel", style: .default, handler: { _ in
                observer.onNext(false)
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "discard", style: .destructive, handler: { _ in
                observer.onNext(true)
                observer.onCompleted()
            }))
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
}

fileprivate struct FormValidator {
    static func validate(name: String) -> Bool {
        return !name.isEmpty
    }
    
    static func validate(description: String) -> Bool {
        return !description.isEmpty
    }
    
    static func validate(location: String) -> Bool {
        return !location.isEmpty
    }
}
