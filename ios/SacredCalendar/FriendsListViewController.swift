//
//  FriendsListViewController.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Material
import RxCocoa
import RxSwift
import UIKit

/// Container for the services required by the friends list view model logic container.
class FriendsViewModelServices: HasFetchFriendsService, HasRequestFriendService, HasLookupUserIdService, HasDeleteFriendService {
    let friends: FetchFriendsService
    let requestFriend: RequestFriendService
    let lookupUser: LookupUserIdService
    let removeFriend: DeleteFriendService
    
    init(friends: FetchFriendsService = .init(), requestFriend: RequestFriendService = .init(), lookupUser: LookupUserIdService = .init(), removeFriend: DeleteFriendService = .init()) {
        self.friends = friends
        self.requestFriend = requestFriend
        self.lookupUser = lookupUser
        self.removeFriend = removeFriend
    }
}

/// Logic container for the friends list view.
class FriendsViewModel {
    typealias Services = HasFetchFriendsService & HasRequestFriendService & HasLookupUserIdService & HasDeleteFriendService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    let friends = PublishSubject<[Friendship]>()
    
    init(services: Services = FriendsViewModelServices()) {
        self.services = services
    }
    
    func fetchFriends() {
        services.friends.execute()
            .take(1)
            .bind(to: friends)
            .disposed(by: trash)
    }
    
    func requestFriendship(userId: Int) -> Observable<Bool> {
        return services.requestFriend.execute(userId: userId)
    }
    
    func getUserId(username: String) -> Observable<Int?> {
        return services.lookupUser.execute(username: username)
    }
    
    /// Deletes the provided friendship. Returns a success flag.
    func deleteFriendship(id: Int) -> Observable<Bool> {
        return services.removeFriend.execute(id: id)
    }
}

class FriendsListViewController: UIViewController {

    @IBOutlet weak var tableView: UITableView!
    
    let viewModel: FriendsViewModel
    
    let trash = DisposeBag()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: FriendsViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "FriendsListViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")

        viewModel.friends
            .take(1)
            .bind(to: tableView.rx.items(cellIdentifier: "Cell")) { row, element, cell in
                cell.textLabel?.text = element.username
                cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
                cell.backgroundColor = .clear
                
                let longPress = UILongPressGestureRecognizer(target: nil, action: nil)
                longPress.rx.event
                    .withLatestFrom(Observable.just(element))
                    .flatMap({ [weak self] in
                        self?.showRemoveFriend(for: $0) ?? .empty()
                    })
                    .filter({ $0 })
                    .withLatestFrom(Observable.just(element))
                    .flatMap({ [weak self] in
                        self?.viewModel.deleteFriendship(id: $0.id) ?? .empty()
                    })
                    .subscribe(onNext: { [weak self] in
                        if $0 {
                            self?.viewModel.fetchFriends()
                        }
                    })
                    .disposed(by: self.trash)
                
                cell.addGestureRecognizer(longPress)
                
            }.disposed(by: trash)
        
        tableView.rx
            .modelSelected(Friendship.self)
            .subscribe(onNext: { [weak self] in
                let logic = EventsViewModel(userId: $0.id)
                let events = EventsViewController(viewModel: logic)
                self?.navigationController?.pushViewController(events, animated: true)
            })
            .disposed(by: trash)
        
        viewModel.fetchFriends()
        
        setup(addFriend: IconButton(title: "add"))
        setup(friendRequests: IconButton(title: "requests"))
    }
    
    func showRemoveFriend(for friend: Friendship) -> Observable<Bool> {
        return Observable.create { observer in
            let alert = UIAlertController(title: "Remove Friend?", message: "Are you sure you would like to remove \(friend.username) as a friend?", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "cancel", style: .cancel, handler: { _ in
                observer.onNext(false)
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "remove", style: .destructive, handler: { _ in
                observer.onNext(true)
                observer.onCompleted()
            }))
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
    
    
    func setup(addFriend button: UIButton) {
        navigationItem.rightViews.append(button)
        
        button.rx.tap
            .flatMap({ [weak self] _ in
                self?.showAddUserUI() ?? .empty()
            })
            .filter({ $0 != nil })
            .flatMap({ [weak self] (username: String?) -> Observable<Int?> in
                print("fetching id for username: \(username!)")
                return self?.viewModel.getUserId(username: username!) ?? .empty()
            })
            .filter({ $0 != nil })
            .flatMap({ [weak self] (id: Int?) -> Observable<Bool> in
                print("id: \(id!)")
                return self?.viewModel.requestFriendship(userId: id!) ?? .empty()
            })
            .subscribe(onNext: { [weak self] in
                if $0 {
                    self?.navigationController?.popViewController(animated: true)
                } else {
                    
                }
            })
            .disposed(by: trash)
    }
    
    func setup(friendRequests button: UIButton) {
        navigationItem.rightViews.append(button)
        
        button.rx.tap
            .subscribe(onNext: { [weak self] in
                let friendRequests = FriendRequestsViewController()
                self?.navigationController?.pushViewController(friendRequests, animated: true)
            })
            .disposed(by: trash)
    }
    
    func showAddUserUI() -> Observable<String?> {
        return Observable.create { observer in
            let alert = UIAlertController(title: "Add Friend", message: "Enter the username of username of the user you would like to add:", preferredStyle: .alert)
            alert.addTextField(configurationHandler: {
                $0.placeholder = "username"
            })
            alert.addAction(UIAlertAction(title: "cancel", style: .cancel, handler: { _ in
                observer.onNext(nil)
                alert.dismiss(animated: true, completion: nil)
            }))
            alert.addAction(UIAlertAction(title: "request", style: .default, handler: { action in
                observer.onNext(alert.textFields?[0].text ?? nil)
                alert.dismiss(animated: true, completion: nil)
            }))
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
}
