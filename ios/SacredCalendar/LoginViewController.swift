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

class AuthViewModelServices: HasAuthService {
    let auth: AuthService
    
    init(auth: AuthService = .init()) {
        self.auth = auth
    }
}

class AuthViewModel {
    typealias Services = HasAuthService
    
    private let services: Services
    
    init(services: AuthViewModelServices = .init()) {
        self.services = services
    }
    
    func login(credentials: Credentials) -> Observable<User> {
        return services.auth.login(credentials: credentials)
    }
    
    func logout() -> Observable<Bool> {
        return services.auth.logout()
    }
}

enum FormValidationState {
    case valid
    case invalid(reasons: [String])
}

class LoginViewController: UIViewController {
    
    @IBOutlet weak var usernameField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    
    @IBOutlet weak var submitButton: UIButton!
    
    let viewModel: AuthViewModel
    
    let formErrors = PublishSubject<[String]>()
    
    let trash = DisposeBag()
    
    var isInitialLaunch = true
    
    init(viewModel: AuthViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "LoginViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        attachFormErrorObserver()
        
        setup(loginButton: submitButton)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if !isInitialLaunch {
            _ = viewModel.logout()
        }
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        
        isInitialLaunch = false
    }
    
    func attachFormErrorObserver() {
        formErrors.filter({
            $0.count > 0
        }).subscribe(onNext: {
            
            // TODO: display form errors
            print($0)
            
        }).disposed(by: trash)
    }
    
    func validateForm(username: String, password: String) -> FormValidationState {
        var messages: [String] = []
        
        if FormValidator.validate(username: username) {
            messages.append("username required")
        }
        
        if FormValidator.validate(password: password) {
            messages.append("password required")
        }
        
        return messages.isEmpty ? .valid : .invalid(reasons: messages)
    }
    
    func setup(loginButton button: UIButton) {
        let form = Observable.combineLatest(
            usernameField.rx.text.orEmpty,
            passwordField.rx.text.orEmpty
        )
            
        button.rx.tap
            .withLatestFrom(form)
            .filter({ [weak self] in
                guard let status = self?.validateForm(username: $0, password: $1) else { return false }
                switch status {
                case .valid: return true
                case .invalid(let reasons):
                    self?.formErrors.onNext(reasons)
                    return false
                }
            })
            .flatMap({ [weak self] username, password -> Observable<User> in
                let credentials = (username: username, password: password)
                return self?.viewModel.login(credentials: credentials) ?? .empty()
            })
            .subscribe(onNext: { [weak self] in
                User.current = $0
                
                print("logged in: \($0.fullName)")
                
                let events = EventsViewController()
                self?.navigationController?.pushViewController(events, animated: true)
            })
            .disposed(by: trash)
    }
}

fileprivate struct FormValidator {
    static func validate(username: String) -> Bool {
        return !username.isEmpty
    }
    
    static func validate(password: String) -> Bool {
        return !password.isEmpty
    }
}
