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

class SignUpViewModelServices: HasCreateUserService {
    let user: CreateUserService
    
    init(user: CreateUserService = .init()) {
        self.user = user
    }
}

class SignUpViewModel {
    typealias Services = HasCreateUserService
    
    private let services: Services
    
    init(services: SignUpViewModelServices = .init()) {
        self.services = services
    }
    
    func createUser() -> Observable<User> {
        return services.user.execute()
    }
}

class SignUpViewController: UIViewController {

    @IBOutlet weak var firstNameField: UITextField!
    @IBOutlet weak var lastNameField: UITextField!
    @IBOutlet weak var usernameField: UITextField!
    
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
        
        setup(submitButton: submitButton)
    }
    
    func setup(submitButton button: UIButton) {
        let form = Observable.combineLatest(
            firstNameField.rx.text.orEmpty,
            lastNameField.rx.text.orEmpty,
            usernameField.rx.text.orEmpty
        )
            
        button.rx.tap
            .withLatestFrom(form)
            .map({
                User.from(name: (first: $0, last: $1), username: $2)
            })
            .flatMap({ [weak self] _ in
                self?.viewModel.createUser() ?? .empty()
            })
            .subscribe(onNext: { [weak self] in
                User.current = $0
                
                print("signed up: \($0.fullName)")
                
                let events = EventsViewController()
                self?.navigationController?.pushViewController(events, animated: true)
            })
            .disposed(by: trash)
    }
}
