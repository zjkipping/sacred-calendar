//
//  ViewController.swift
//  SacredCalendar
//
//  Created by Developer on 9/19/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

import RxCocoa
import RxSwift

/// Container for services used in AuthViewModel
class AuthViewModelServices: HasAuthService {
    let auth: AuthService
    
    init(auth: AuthService = .init()) {
        self.auth = auth
    }
}

/// Logic for the screens requiring authentication centered functionality.
class AuthViewModel {
    typealias Services = HasAuthService
    
    /// Contains the async services required for this logical component.
    private let services: Services
    
    init(services: AuthViewModelServices = .init()) {
        self.services = services
    }
    
    /// Takes user credentials and sends a login request, returns success flag and
    /// optional error message.
    func login(credentials: Credentials) -> Observable<(Bool, String?)> {
        return services.auth.login(credentials: credentials)
    }
    
    /// Sends a logout request and returns a success flag.
    func logout() -> Observable<Bool> {
        return services.auth.logout()
    }
}

/// Possible states for the form validation state.
enum FormValidationState: Equatable {
    case valid
    /// Cotains a list of error messages
    case invalid(reasons: [String])
}

/// Equatable conformance for FormValidationState.
func ==(lhs: FormValidationState, rhs: FormValidationState) -> Bool {
    switch (lhs, rhs) {
    case (.valid, .valid): return true
    default: return false
    }
}

/// Responsible for displaying data to the login screen.
class LoginViewController: UIViewController {
    
    @IBOutlet weak var usernameField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    
    @IBOutlet weak var errorLabel: UILabel!
    
    @IBOutlet weak var submitButton: UIButton!
    @IBOutlet weak var signUpButton: UIButton!
    
    let viewModel: AuthViewModel
    
    let formErrors = BehaviorSubject<[String]>(value: [""])
    
    let trash = DisposeBag()
    
    var isInitialLaunch = true
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: AuthViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "LoginViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Sacred Calendar")
        
        attachFormErrorObserver()
        
        setup(loginButton: submitButton)
        setup(signUpButton: signUpButton)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // If returning to this screen, log the current user out
        if !isInitialLaunch {
            _ = viewModel.logout()
        }
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        
        isInitialLaunch = false
    }
    
    /// Observes the formErrors stream and binds messages to the error label
    func attachFormErrorObserver() {
        formErrors
            .map({ $0.first })
            .bind(to: errorLabel.rx.text)
            .disposed(by: trash)
    }
    
    /// Validates the form input before submitting to server
    func validateForm(username: String, password: String) -> FormValidationState {
        var messages: [String] = []
        
        if !FormValidator.validate(username: username) {
            messages.append("username required")
        }
        
        if !FormValidator.validate(password: password) {
            messages.append("password required")
        }
        
        // Valid if no error messages are present, otherwise pass them along
        return messages.isEmpty ? .valid : .invalid(reasons: messages)
    }
    
    /// Attaches observers to the login button to perform form validation followed by
    /// network request.
    func setup(loginButton button: UIButton) {
        let form = Observable.combineLatest(
            usernameField.rx.text.orEmpty,
            passwordField.rx.text.orEmpty
        )
            
        button.rx.tap
            .withLatestFrom(form)
            .filter({ [weak self] in
                guard let self = self else { return false }
                
                switch self.validateForm(username: $0, password: $1) {
                case .valid: return true
                case .invalid(let reasons):
                    self.formErrors.onNext(reasons)
                    return false
                }
            })
            .flatMap({ [weak self] username, password -> Observable<(Bool, String?)> in
                let credentials = (username: username, password: password)
                return self?.viewModel.login(credentials: credentials) ?? .empty()
            })
            .subscribe(onNext: { [weak self] success, errorMessage in
//                User.current = $0
                
//                print("logged in: \($0.fullName)")
                
                if success {
                    let events = EventsViewController()
                    self?.navigationController?.pushViewController(events, animated: true)
                } else if let errorMessage = errorMessage {
                    self?.formErrors.onNext([errorMessage])
                }
                
            })
            .disposed(by: trash)
    }
    
    /// Attaches an observer to the sign up button to open the sign up flow.
    func setup(signUpButton button: UIButton) {
        button.rx.tap
            .subscribe(onNext: { [weak self] _ in
                let signUp = SignUpViewController()
                self?.navigationController?.pushViewController(signUp, animated: true)
            })
            .disposed(by: trash)
    }
}

/// Validates the form inputs.
fileprivate struct FormValidator {
    static func validate(username: String) -> Bool {
        return !username.isEmpty
    }
    
    static func validate(password: String) -> Bool {
        return !password.isEmpty
    }
}
