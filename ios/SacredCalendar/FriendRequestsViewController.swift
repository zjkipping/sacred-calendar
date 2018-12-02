//
//  FriendRequestsViewController.swift
//  SacredCalendar
//
//  Created by Developer on 12/1/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import Material
import RxCocoa
import RxSwift
import UIKit

/// Async operations for fetching friend requests.
class FetchFriendRequestsService {
    
    func fetch() -> Observable<[FriendRequest]> {
        return Observable.create { observer in
            let request = API.request(.friendRequests, .list) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let requests = FriendRequest.create(from: response.data.arrayValue) else {
                    return
                }
                
                observer.onNext(requests)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

/// Async operations for fetching friend requests.
class FriendRequestService {
    
    func accept(id: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.friendRequests, .accept, ["id" : id]) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                observer.onNext(true)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
    
    func deny(id: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.friendRequests, .deny, ["id" : id]) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                observer.onNext(true)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

protocol HasFetchFriendRequestsService {
    var friendRequests: FetchFriendRequestsService { get }
}

protocol HasFriendRequestService {
    var friendRequest: FriendRequestService { get }
}

/// Container for the services required by the friends list view model logic container.
class FriendRequestsViewModelServices: HasFetchFriendRequestsService, HasFriendRequestService {
    let friendRequests: FetchFriendRequestsService
    let friendRequest: FriendRequestService
    
    init(friendRequests: FetchFriendRequestsService = .init(), friendRequest: FriendRequestService = .init()) {
        self.friendRequests = friendRequests
        self.friendRequest = friendRequest
    }
}

/// Logic container for the friends list view.
class FriendRequestsViewModel {
    typealias Services = HasFetchFriendRequestsService & HasFriendRequestService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    let friendRequests = PublishSubject<[FriendRequest]>()
    
    init(services: Services = FriendRequestsViewModelServices()) {
        self.services = services
    }
    
    func fetchFriendRequests() {
        services.friendRequests.fetch()
            .take(1)
            .bind(to: friendRequests)
            .disposed(by: trash)
    }
    
    func accept(request: FriendRequest) -> Observable<Bool> {
        return services.friendRequest.accept(id: request.id)
    }
    
    func deny(request: FriendRequest) -> Observable<Bool> {
        return services.friendRequest.deny(id: request.id)
    }
}

class FriendRequestsViewController: UIViewController {
    
    enum FriendRequestAction {
        case accept, deny
    }

    @IBOutlet weak var tableView: UITableView!
    
    let viewModel: FriendRequestsViewModel
    
    let trash = DisposeBag()
   
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: FriendRequestsViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "FriendRequestsViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Friend Requests")

        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        
        viewModel.friendRequests
            .bind(to: tableView.rx.items(cellIdentifier: "Cell")) { row, element, cell in
                cell.textLabel?.text = element.username
                cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
                cell.backgroundColor = .clear
            }.disposed(by: trash)
        
        tableView.rx.modelSelected(FriendRequest.self)
            .flatMap({ [weak self] in
                self?.showOptionDialog(for: $0) ?? .empty()
            })
            .filter({ $1 != nil })
            .flatMap({ [weak self] (request: FriendRequest, action: FriendRequestAction?) -> Observable<Bool> in
                guard let self = self else { return .empty() }
                switch action! {
                case .accept:
                    return self.viewModel.accept(request: request)
                case .deny:
                    return self.viewModel.deny(request: request)
                }
            })
            .subscribe(onNext: { [weak self] in
                self?.viewModel.fetchFriendRequests()
                
                if $0 {
                    print("success")
                } else {
                    print("failure")
                }
            })
            .disposed(by: trash)
        
        viewModel.fetchFriendRequests()
    }
    
    func showOptionDialog(for request: FriendRequest) -> Observable<(FriendRequest, FriendRequestAction?)> {
        return Observable.create { observer in
            let alert = UIAlertController(title: request.username, message: "\(request.username) would like to be friends!", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "accept", style: .default, handler: { _ in
                observer.onNext((request, .accept))
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "deny", style: .destructive, handler: { _ in
                observer.onNext((request, .deny))
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "ignore", style: .cancel, handler: { _ in
                observer.onNext((request, nil))
                observer.onCompleted()
            }))
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
}
