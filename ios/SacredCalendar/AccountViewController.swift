//
//  AccountViewController.swift
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

/// Container for the services required by the account view model logic container.
class AccountViewModelServices: HasFetchUserService, HasAuthService {
    let fetchUser: FetchUserService
    var auth: AuthService
    
    init(fetchUser: FetchUserService = .init(), auth: AuthService = .init()) {
        self.fetchUser = fetchUser
        self.auth = auth
    }
}

/// Logic container for the account view.
class AccountViewModel {
    typealias Services = HasFetchUserService & HasAuthService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    init(services: Services = AccountViewModelServices()) {
        self.services = services
    }
    
    func logout() -> Observable<Bool> {
        return services.auth.logout()
    }
}

/// Responsible for displaying the account view.
class AccountViewController: UIViewController {
    
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var usernameLabel: UILabel!
    
    @IBOutlet weak var friendsButton: UIButton!
    @IBOutlet weak var invitesButton: UIButton!
    @IBOutlet weak var logoutButton: UIButton!

    let viewModel: AccountViewModel
    
    let trash = DisposeBag()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: AccountViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "AccountViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Account")
        
        setup(friendsButton: friendsButton)
        setup(invitesButton: invitesButton)
        setup(logoutButton: logoutButton)
        
        populateUI()
    }
    
    func populateUI() {
        nameLabel.text = User.current.fullName
        usernameLabel.text = User.current.username
    }
    
    func setup(friendsButton button: UIButton) {
        button.rx.tap
            .subscribe(onNext: { [weak self] in
                let friends = FriendsListViewController<Friendship>()
                self?.navigationController?.pushViewController(friends, animated: true)
            })
            .disposed(by: trash)
    }
    
    func setup(invitesButton button: UIButton) {
        button.rx.tap
            .subscribe(onNext: { [weak self] in
                let eventInvites = EventInvitesViewController()
                self?.navigationController?.pushViewController(eventInvites, animated: true)
            })
            .disposed(by: trash)
    }
    
    func setup(logoutButton button: UIButton) {
        button.rx.tap
            .flatMap({ [weak self] in
                self?.viewModel.logout() ?? .empty()
            })
            .subscribe(onNext: { [weak self] _ in
                self?.navigationController?.popToRootViewController(animated: true)
            })
            .disposed(by: trash)
    }
}
