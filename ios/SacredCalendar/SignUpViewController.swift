//
//  SignUpViewController.swift
//  SacredCalendar
//
//  Created by Developer on 10/15/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import RxCocoa
import RxSwift

class SignUpViewModelServices: HasCreateUserService, HasAuthService, HasFetchUserService {
    let user: CreateUserService
    let auth: AuthService
    let fetchUser: FetchUserService

    init(user: CreateUserService = .init(), auth: AuthService = .init(), fetchUser: FetchUserService = .init()) {
        self.user = user
        self.auth = auth
        self.fetchUser = fetchUser
    }
}

class SignUpViewModel {
    typealias Services = HasCreateUserService & HasAuthService & HasFetchUserService
    
    private let services: Services
    
    init(services: SignUpViewModelServices = .init()) {
        self.services = services
    }
    
    func createUser(data: [String : Any]) -> Observable<Bool> {
        return services.user.execute(data: data)
    }
    
    func login(credentials: Credentials) -> Observable<(Bool, String?)> {
        return services.auth.login(credentials: credentials)
    }
    
    func fetchUser() -> Observable<User> {
        return services.fetchUser.execute()
    }
}

class SignUpViewController: UIViewController {

    @IBOutlet weak var firstNameField: UITextField!
    @IBOutlet weak var lastNameField: UITextField!
    @IBOutlet weak var usernameField: UITextField!
    @IBOutlet weak var emailField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    @IBOutlet weak var verifyPasswordField: UITextField!
    
    @IBOutlet weak var submitButton: UIButton!
    
    let viewModel: SignUpViewModel
    
    let trash = DisposeBag()
    
    init(viewModel: SignUpViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "SignUpViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Sign Up")
        
        setup(submitButton: submitButton)
        
        observe(passwords: Observable.combineLatest(
            passwordField.rx.text.orEmpty,
            verifyPasswordField.rx.text.orEmpty
        ))
        
        let fields: [(field: UITextField, name: String)] = [
            (firstNameField, "First Name"),
            (lastNameField, "Last Name"),
            (usernameField, "Username"),
            (emailField, "Email"),
            (passwordField, "Password"),
            (verifyPasswordField, "Verify Password")
        ]
        
        fields.forEach {
            self.observe(fieldCompletion: $0.rx.text.orEmpty, fieldName: $1)
        }
    }
    
    func observe(fieldCompletion field: ControlProperty<String>, fieldName: String) {
        field
            .skip(2)
            .filter({ $0.isEmpty })
            .subscribe(onNext: { [weak self] _ in
                self?.display(error: .fieldNotCompleted(fieldName: fieldName))
            })
            .disposed(by: trash)
    }
    
    func observe(passwords: Observable<(String, String)>) {
        passwords
            .withLatestFrom(passwords)
            .filter({ [weak self] in
                !(self?.validate(password: $0.0, verification: $0.1) ?? true)
            })
            .subscribe(onNext: { [weak self] _ in
                self?.display(error: .passwordsDoNotMatch)
            })
            .disposed(by: trash)
    }
    
    
    func setup(submitButton button: UIButton) {
        let credentials = Observable.combineLatest(
            usernameField.rx.text.orEmpty,
            passwordField.rx.text.orEmpty
        )
        
        let passwords = Observable.combineLatest(
            passwordField.rx.text.orEmpty,
            verifyPasswordField.rx.text.orEmpty
        )
        
        let form = Observable.combineLatest(
            firstNameField.rx.text.orEmpty,
            lastNameField.rx.text.orEmpty,
            usernameField.rx.text.orEmpty,
            emailField.rx.text.orEmpty,
            passwordField.rx.text.orEmpty
        )
        
        button.rx.tap
            .withLatestFrom(passwords)
            .filter({ [weak self] in
                !(self?.validate(password: $0.0, verification: $0.1) ?? true)
            })
            .subscribe(onNext: { [weak self] _ in
                self?.display(error: .passwordsDoNotMatch)
            })
            .disposed(by: trash)
        
        button.rx.tap
            .withLatestFrom(passwords)
            .filter({ [weak self] in
                self?.validate(password: $0, verification: $1) ?? false
            })
            .withLatestFrom(form)
            .map({ first, last, username, email, password in
                User.from(name: (first: first, last: last),
                      username: username,
                         email: email,
                      password: password)
            })
            .flatMap({ [weak self] in
                self?.viewModel.createUser(data: $0) ?? .empty()
            })
            .withLatestFrom(credentials)
            .flatMap({ [weak self] in
                self?.viewModel.login(credentials: (username: $0, password: $1)) ?? .empty()
            })
            .flatMap({ [weak self] _ in
                self?.viewModel.fetchUser() ?? .empty()
            })
            .subscribe(onNext: { [weak self] in
                User.current = $0
                
                print("signed up: \($0.fullName)")

                let events = EventsViewController()
                self?.navigationController?.pushViewController(events, animated: true)
            })
            .disposed(by: trash)
    }
    
    func display(error: FormError) {
        switch error {
        case .passwordsDoNotMatch:
            print("passwords do not match")
        case .fieldNotCompleted(let fieldName):
            print("\(fieldName) empty")
        }
    }
    
    func validate(password: String, verification: String) -> Bool {
        return password == verification
    }
}

enum FormError {
    case passwordsDoNotMatch
    case fieldNotCompleted(fieldName: String)
}
