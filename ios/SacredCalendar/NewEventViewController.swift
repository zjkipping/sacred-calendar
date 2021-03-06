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

/// Container for the services for the new event view model.
class NewEventViewModelServices: HasCreateEventService, HasFetchCategoryService, HasEventInvitesService {
    let events: CreateEventService
    let fetchCategories: FetchCategoryService
    var eventInvite: EventInvitesService
    
    init(events: CreateEventService = .init(), fetchCategories: FetchCategoryService = .init(), eventInvite: EventInvitesService = .init()) {
        self.events = events
        self.fetchCategories = fetchCategories
        self.eventInvite = eventInvite
    }
}

/// Logic container for the new event view.
class NewEventViewModel {
    typealias Services = HasCreateEventService & HasFetchCategoryService & HasEventInvitesService
    
    /// Container for the async operations.
    let services: Services
    
    let viewMode = PublishSubject<CalendarView>()
    
    let events = PublishSubject<[Event]>()
    
    let invitees = BehaviorSubject<Set<AvailableFriend>>(value: [])
    
    let trash = DisposeBag()
    
    init(services: Services = NewEventViewModelServices()) {
        self.services = services
    }
    
    /// Creates a new event in the database.
    func submit(data: [String : Any]) -> Observable<Int> {
        return services.events.execute(data: data)
    }
    
    /// Fetches the custom categories for the current user.
    func fetchCategories() -> Observable<[Category]> {
        return services.fetchCategories.execute()
    }
    
    func send(invites: [Int], id: Int) -> Observable<Bool> {
        return services.eventInvite.send(invites: invites, id: id)
    }
}

/// Responsible for displaying the new event view.
class NewEventViewController: UIViewController {
    /// Options for time inputs.
    enum EventTime {
        case start, end
    }
    
    /// Reference to modular form view.
    @IBOutlet weak var formView: NewEventFormView!
    
    @IBOutlet weak var submitButton: UIButton!
    @IBOutlet weak var cancelButton: UIButton!
    
    let date = BehaviorSubject<Date>(value: Date())
    
    let startDate = BehaviorSubject<Date>(value: Date())
    let endDate = BehaviorSubject<Date>(value: Date())
    
    let viewModel: NewEventViewModel
    
    let trash = DisposeBag()
    
    let formErrors = PublishSubject<[String]>()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
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
        
        // observes the deleteced date, formats it, and binds it to a label
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
        
        // observes the form errors and displays them
        formErrors.subscribe(onNext: {
            print($0)
        }).disposed(by: trash)
        
        setup(inviteButton: formView.inviteButton)
        
        setup(newCategoryButton: formView.newCategoryButton)
        
        viewModel.invitees
            .subscribe(onNext: { [weak self] in
                self?.formView.inviteesStackView.arrangedSubviews.forEach { $0.removeFromSuperview() }
                
                guard $0.count > 0 else { return }
                
                let header = UILabel()
                header.attributedText = NSAttributedString(string: "Invitees", attributes: [NSAttributedString.Key.underlineStyle: NSUnderlineStyle.single.rawValue])
                header.fontSize = 20
                header.textColor = .white
                header.textAlignment = .center
                self?.formView.inviteesStackView.addArrangedSubview(header)
                
                for invitee in $0 {
                    let label = UILabel()
                    label.text = invitee.username
                    label.textColor = .white
                    label.textAlignment = .center
                    self?.formView.inviteesStackView.addArrangedSubview(label)
                }
            })
            .disposed(by: trash)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // fetches the current user's categories and populates the dropdown
        viewModel.fetchCategories()
            .subscribe(onNext: { [weak self] categories in
                self?.formView.categoryDropdown.optionArray = categories.map { $0.name }
                self?.formView.categoryDropdown.optionIds = categories.map { $0.id }
            }).disposed(by: trash)
    }
    
    /// Adds a tap observer to launch the new category flow.
    func setup(newCategoryButton button: UIButton) {        
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let newCategory = NewCategoryViewController()
                self?.navigationController?.pushViewController(newCategory, animated: true)
            }).disposed(by: trash)
    }
    
    /// Adds a tap observer to launch the friend selection flow.
    func setup(inviteButton button: UIButton) {
        let form = Observable.combineLatest(
            date,
            startDate,
            endDate
        )
        
        button.rx.tap
            .withLatestFrom(form)
            .subscribe(onNext: { [weak self] in
                guard let self = self else { return }
                
                let calendar = Calendar.current
                let beginningOfToday = calendar.startOfDay(for: Date())
                
                let date = calendar.startOfDay(for: $0)
                
                let startTime = date.addingTimeInterval($1.timeIntervalSince(beginningOfToday) - 6 * 60 * 60)
                let endTime = date.addingTimeInterval($2.timeIntervalSince(beginningOfToday) - 6 * 60 * 60)
                
                let options = FriendsListViewController<AvailableFriend>.Options(isSelectable: true, startTime: startTime, endTime: endTime)
                let logic = FriendsViewModel<AvailableFriend>()
                logic.selection
                    .bind(to: self.viewModel.invitees)
                    .disposed(by: logic.trash)
                let friends = FriendsListViewController(viewModel: logic, options: options)
                
                self.navigationController?.pushViewController(friends, animated: true)
            }).disposed(by: trash)
    }
    
    /// Formats a date stream.
    func formated(date: Observable<Date>) -> Observable<String> {
        return date.map({
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return formatter.string(from: $0)
        })
    }
    
    /// Binds a String stream to a String observer.
    func bind(observable: Observable<String>, to property: Binder<String?>) {
        observable.bind(to: property).disposed(by: trash)
    }
    
    /// Displays the datetime picker for a given mode and initial value.
    func showDatePicker(mode: UIDatePicker.Mode, title: String, date initial: Date?) -> Observable<Date> {

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
        picker.date = initial ?? Date()
        
        // constructs peripheral views for the datetime picker
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
        
        // adds views to container and defines their layout constraints
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
        
        // constructs a date observable, offset to correct for discrepencies, and dissolves
        // the datetime picker when fired.
        return done.rx.tap
                .withLatestFrom(picker.rx.date)
                .take(1)
                .do(onCompleted: container.removeFromSuperview)
    }
    
    /// Attaches tap observer for showing date picker.
    func setup(editDateButton button: UIButton) {
        button.rx.tap
            .withLatestFrom(date)
            .flatMap({ [weak self] in
                self?.showDatePicker(mode: .date, title: "Date", date: $0) ?? .empty()
            })
            .bind(to: date)
            .disposed(by: trash)
    }
    
    /// Attaches tap observer for showing time picker (relative to a given selected property).
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
    
    /// Attaches a tap observer to validate the form and submit a new event to the database.
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            formView.nameField.rx.text.orEmpty,
            formView.descriptionField.rx.text.orEmpty,
            formView.locationField.rx.text.orEmpty,
            date,
            startDate,
            endDate
        )
        
        // validates the form, builds the appropriate structure for backend and submits to server
        
        let eventCreated = button.rx.tap
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
                })
                .map({ [weak self] in
                    let calendar = Calendar.current
                    let beginningOfToday = calendar.startOfDay(for: Date())
                    
                    let startTime = $4.timeIntervalSince(beginningOfToday) + 60 * 60 * 6
                    let endTime = $5.timeIntervalSince(beginningOfToday) + 60 * 60 * 6
                    
                    var data: [String : Any] = [
                        "name" : $0,
                        "description" : $1,
                        "location" : $2,
                        "date" : $3.timeIntervalSince1970,
                        "startTime" : startTime,
                        "endTime" : endTime,
                    ]
                    
                    if let dropdown = self?.formView.categoryDropdown,
                        let selected = dropdown.selectedIndex,
                        let id = dropdown.optionIds?[selected] {
                        data["categoryID"] = id
                    }
                    return data
                })
                .flatMap({ [weak self] data -> Observable<Int> in
                    self?.viewModel.submit(data: data) ?? .empty()
                })
                .share()
        
        let invitesSent = eventCreated
            .withLatestFrom(viewModel.invitees) { (id: $0, invitees: $1) }
            .filter({ $0.invitees.count > 0 })
            .map({ args -> (Int, [Int]) in
                (id: args.id, invitees: args.invitees.map { $0.id })
            })
            .flatMap({ [weak self] data -> Observable<Bool> in
                self?.viewModel.send(invites: data.1, id: data.0) ?? .empty()
            })
        
        invitesSent
            .subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
            })
            .disposed(by: trash)
        
        eventCreated
            .withLatestFrom(viewModel.invitees) { (id: $0, invitees: $1) }
            .filter({ $0.invitees.count == 0 })
            .subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popViewController(animated: true)
            })
            .disposed(by: trash)
    }
    
    /// Attaches a tap observer to cancel the current form.
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
    
    /// Validates the form for specified input values.
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
        
        // if no error messages are present: valid, if so: pass along error messages
        return messages.isEmpty ? .valid : .invalid(reasons: messages)
    }
    
    /// Displays cancel form confirmation modal.
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

/// Validates form input values.
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
