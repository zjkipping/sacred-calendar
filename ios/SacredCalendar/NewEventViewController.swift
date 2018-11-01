//
//  NewEventViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/29/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import Cartography
import iOSDropDown
import Material
import MaterialComponents
import RxCocoa
import RxSwift

class NewEventViewModelServices: HasCreateEventService, HasFetchCategoryService {
    let events: CreateEventService
    let fetchCategories: FetchCategoryService
    
    init(events: CreateEventService = .init(), fetchCategories: FetchCategoryService = .init()) {
        self.events = events
        self.fetchCategories = fetchCategories
    }
}

class NewEventViewModel {
    typealias Services = HasCreateEventService & HasFetchCategoryService
    
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
    
    func fetchCategories() -> Observable<[Category]> {
        return services.fetchCategories.execute()
    }
}

class NewEventViewController: UIViewController {
    enum EventTime {
        case start, end
    }
    
    @IBOutlet weak var formView: NewEventFormView!
    
    @IBOutlet weak var submitButton: UIButton!
    @IBOutlet weak var cancelButton: UIButton!
    
    let date = BehaviorSubject<Date>(value: Date())
    
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
        
        date
            .map({
                let formatter = DateFormatter()
                formatter.dateFormat = "MM/dd/YYYY"
                return formatter.string(from: $0)
            })
            .bind(to: formView.dateLabel.rx.text)
            .disposed(by: trash)
        setup(editDateButton: formView.editDateButton)
        setup(editTimeButton: formView.editStartTimeButton, time: .start)
        setup(editTimeButton: formView.editEndTimeButton, time: .end)
        
        bind(observable: formated(date: startDate), to: formView.startDateLabel.rx.text)
        bind(observable: formated(date: endDate), to: formView.endDateLabel.rx.text)
        
        formErrors.subscribe(onNext: {
            print($0)
        }).disposed(by: trash)
        
        viewModel.fetchCategories()
            .subscribe(onNext: { [weak self] categories in
                self?.formView.categoryDropdown.optionArray = categories.map { $0.name }
                self?.formView.categoryDropdown.optionIds = categories.map { $0.id }
            }).disposed(by: trash)
        
        setup(newCategoryButton: formView.newCategoryButton)
    }
    
    func setup(newCategoryButton button: UIButton) {        
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let newCategory = NewCategoryViewController()
                self?.navigationController?.pushViewController(newCategory, animated: true)
            }).disposed(by: trash)
    }
    
    func formated(date: Observable<Date>) -> Observable<String> {
        return date.map({ $0.timeString })
    }
    
    func bind(observable: Observable<String>, to property: Binder<String?>) {
        observable.bind(to: property).disposed(by: trash)
    }
    
    func showDatePicker(mode: UIDatePicker.Mode, title: String, date: Date?) -> Observable<Date> {
        let blur = UIBlurEffect(style: .dark)
        let blurred = UIVisualEffectView(effect: blur)
        blurred.layer.cornerRadius = 14
        blurred.clipsToBounds = true
        let container = blurred.contentView
        
        let picker = UIDatePicker()
        let color = "26A69A"
        let index = color.index(color.startIndex, offsetBy: 1)
        
        let hex = color[index...]
        if let hexNumber = Int(hex, radix: 16) {
            picker.setValue(UIColor(rgb: UInt32(hexNumber)), forKeyPath: "textColor")
        }
        picker.datePickerMode = mode
        picker.date = date ?? Date()
        
        let done = MDCRaisedButton()
        done.setTitle("DONE", for: .normal)
        done.setTitleColor(.white, for: .normal)
        done.setBackgroundColor(.blue, for: .normal)
        
        let label = UILabel()
        label.textColor = .white
        label.textAlignment = .center
        label.text = title
        label.font = label.font.asBold()
        label.fontSize = 40
        
        container.addSubview(label)
        container.addSubview(done)
        container.addSubview(picker)
        constrain(picker, done, label, container) {
            $2.top == $3.top + 10
            $2.centerX == $3.centerX
            
            $1.height == 44
            $1.centerX == $3.centerX
            
            $0.top == $2.top + 20
            $0.bottom == $1.top
            $1.bottom == $3.bottom - 10
        }
        
        view.addSubview(blurred)
        constrain(blurred, view) {
            $0.center == $1.center
            $0.width == $1.width * 0.95
        }
        
        return done.rx.tap
                    .withLatestFrom(picker.rx.date)
                    .take(1)
                    .do(onCompleted: container.removeFromSuperview)
    }
    
    func setup(editDateButton button: UIButton) {
        button.rx.tap
            .withLatestFrom(date)
            .flatMap({ [weak self] in
                self?.showDatePicker(mode: .date, title: "Date", date: $0) ?? .empty()
            })
            .bind(to: date)
            .disposed(by: trash)
    }
    
    func setup(editTimeButton button: UIButton, time: EventTime) {
        let dateOption = time == .start ? startDate : endDate
        let title = time == .start ? "Start Time" : "End Time"
        
        button.rx.tap
            .withLatestFrom(dateOption)
            .flatMap({ [weak self] in
                self?.showDatePicker(mode: .time, title: title, date: $0) ?? .empty()
            })
            .bind(to: dateOption)
            .disposed(by: trash)
    }
    
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            formView.nameField.rx.text.orEmpty,
            formView.descriptionField.rx.text.orEmpty,
            formView.locationField.rx.text.orEmpty,
            date,
            startDate,
            endDate
        )
        
        button.rx.tap
            .withLatestFrom(form)
            .filter({ [weak self] in
                guard let self = self else { return false }
                _ = $3
                _ = $4
                _ = $5
                
                switch self.validateForm(name: $0, description: $1, location: $2) {
                case .valid: return true
                case .invalid(let reasons):
                    self.formErrors.onNext(reasons)
                    return false
                }
            }).map({ [weak self] in
                var data: [String : Any] = [
                    "name" : $0,
                    "description" : $1,
                    "location" : $2,
                    "date" : $3.dateString,
                    "startTime" : $4.timeString,
                    "endTime" : $5.timeString,
                ]
                
                if let dropdown = self?.formView.categoryDropdown,
                   let selected = dropdown.selectedIndex,
                   let id = dropdown.optionIds?[selected] {
                    data["categoryID"] = id
                }
                return data
            }).flatMap({ [weak self] in
                self?.viewModel.submit(data: $0) ?? .empty()
            }).subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
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
