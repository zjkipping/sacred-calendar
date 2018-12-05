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
class FriendsViewModelServices: HasFetchFriendsService, HasRequestFriendService, HasLookupUserIdService, HasDeleteFriendService, HasAvailabilityService {
    let friends: FetchFriendsService
    let requestFriend: RequestFriendService
    let lookupUser: LookupUserIdService
    let removeFriend: DeleteFriendService
    let availability: AvailabilityService
    
    init(friends: FetchFriendsService = .init(), requestFriend: RequestFriendService = .init(), lookupUser: LookupUserIdService = .init(), removeFriend: DeleteFriendService = .init(), availability: AvailabilityService = .init()) {
        self.friends = friends
        self.requestFriend = requestFriend
        self.lookupUser = lookupUser
        self.removeFriend = removeFriend
        self.availability = availability
    }
}

/// Logic container for the friends list view.
class FriendsViewModel<T: Friend> {
    typealias Services = HasFetchFriendsService & HasRequestFriendService & HasLookupUserIdService & HasDeleteFriendService & HasAvailabilityService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    let friends = PublishSubject<[T]>()
    
    let selection = BehaviorSubject<Set<T>>(value: [])
    
    init(services: Services = FriendsViewModelServices()) {
        self.services = services
    }
    
    func fetchFriends() {
        services.friends.execute()
            .take(1)
            .map({ $0 as! [T] })
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
    
    func fetchAvailableFriends(startTime: Date, endTime: Date?) {
        var query = ["start" : startTime.timeIntervalSince1970]
        
        if let endTime = endTime {
            query["end"] = endTime.timeIntervalSince1970
        }
        
        services.availability.execute(query: query)
            .take(1)
            .map({ $0 as! [T] })
            .bind(to: friends)
            .disposed(by: trash)
    }
}

protocol Friend: Hashable {
    var id: Int { get }
    var username: String { get }
}

extension Friend {
    var hashValue: Int {
        return id
    }
}

class FriendsListViewController<T: Friend>: UIViewController {
    
    struct Options {
        let isSelectable: Bool
        let startTime: Date
        let endTime: Date?
    }

    @IBOutlet weak var tableView: UITableView!
    
    let viewModel: FriendsViewModel<T>
    
    let trash = DisposeBag()
    
    let options: Options
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: FriendsViewModel<T> = .init(), options: Options? = nil) {
        self.viewModel = viewModel
        self.options = options ?? Options(isSelectable: false, startTime: Date(), endTime: nil)
        
        super.init(nibName: "FriendsListViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        tableView.allowsMultipleSelection = options.isSelectable

        viewModel.friends
            .take(1)
            .bind(to: tableView.rx.items(cellIdentifier: "Cell")) { [weak self] row, element, cell in
                guard let self = self else { return }
                
                cell.textLabel?.text = element.username
                cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
                cell.backgroundColor = .clear
                
                guard !self.options.isSelectable else { return }
                
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
        
        let friendSelected = tableView.rx
            .modelSelected(T.self)
        
        let friendDeselected = tableView.rx
            .modelDeselected(T.self)
        
        let rowSelected = tableView.rx
            .itemSelected
        
        let rowDeselected = tableView.rx
            .itemDeselected
        
        let toggled = Observable.merge(
            friendSelected.map({ ($0, true) }),
            friendDeselected.map({ ($0, false)})
        )
        
        let font = UIFont.systemFont(ofSize: 26)
        let bold = UIFont.boldSystemFont(ofSize: 26)
        
        if options.isSelectable {
            toggled
                .withLatestFrom(viewModel.selection) { ($1, $0) }
                .map({ friends, action in
                    action.1 ? friends.union([action.0]) : friends.subtracting([action.0])
                })
                .bind(to: viewModel.selection)
                .disposed(by: trash)
            
            rowSelected
                .subscribe(onNext: { [weak self] in
                    guard let self = self else { return }
                    
                    let cell = self.tableView.cellForRow(at: $0)
                    
                    cell?.textLabel?.font = bold
                })
                .disposed(by: trash)
            
            rowDeselected
                .subscribe(onNext: { [weak self] in
                    guard let self = self else { return }
                    
                    let cell = self.tableView.cellForRow(at: $0)
                    
                    cell?.textLabel?.font = font
                })
                .disposed(by: trash)
        } else {
            friendSelected
                .subscribe(onNext: { [weak self] in
                    let logic = EventsViewModel(userId: $0.id)
                    let events = EventsViewController(viewModel: logic)
                    self?.navigationController?.pushViewController(events, animated: true)
                })
                .disposed(by: trash)
        }
        
        if options.isSelectable {
            viewModel.fetchAvailableFriends(startTime: options.startTime, endTime: options.endTime)
        } else {
            viewModel.fetchFriends()
            
            setup(addFriend: IconButton(title: "add"))
            setup(friendRequests: IconButton(title: "requests"))
        }
    }
    
    func showRemoveFriend(for friend: T) -> Observable<Bool> {
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
