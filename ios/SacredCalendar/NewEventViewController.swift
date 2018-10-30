//
//  NewEventViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/29/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

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
    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var descriptionField: UITextField!
    @IBOutlet weak var locationField: UITextField!
    
    @IBOutlet weak var submitButton: UIButton!
    @IBOutlet weak var cancelButton: UIButton!
    
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
        
        setup(submitButton: submitButton)
        setup(cancelButton: cancelButton)
    }
    
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            nameField.rx.text.orEmpty,
            descriptionField.rx.text.orEmpty,
            locationField.rx.text.orEmpty
        )
        
        button.rx.tap
            .withLatestFrom(form)
            .filter({ [weak self] in
                guard let self = self else { return false }

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
        
        if FormValidator.validate(name: name) {
            messages.append("name required")
        }
        
        if FormValidator.validate(description: description) {
            messages.append("description required")
        }
        
        if FormValidator.validate(location: location) {
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
