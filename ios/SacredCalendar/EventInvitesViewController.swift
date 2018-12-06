//
//  EventInvitesViewController.swift
//  SacredCalendar
//
//  Created by Developer on 12/2/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

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

/// Async operations for fetching friends.
class FetchEventInvitesService {
    
    func execute() -> Observable<[EventInvite]> {
        return Observable.create { observer in
            let request = API.request(.eventInvites, .list) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    return
                }
                
                guard let invites = EventInvite.create(from: response.data.array ?? []) else {
                    return
                }
                
                observer.onNext(invites)
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
}

class EventInvitesService {
    
    func send(invites: [Int], id: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let data: [String : Any] = [
                "id" : id,
                "invites" : invites,
            ]
            
            let request = API.request(.event, .invite, data) { response in
                guard response.success else {
                    observer.onError(response.error!)
                    observer.onCompleted()
                    return
                }
                
                observer.onNext(true)
                observer.onCompleted()
            }
            
            return Disposables.create {
                request.cancel()
            }
        }
    }
    
    func accept(inviteId: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.event, .accept, ["id" : inviteId]) { response in
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
    
    func deny(inviteId: Int) -> Observable<Bool> {
        return Observable.create { observer in
            let request = API.request(.event, .deny, ["id" : inviteId]) { response in
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

protocol HasFetchEventInvitesService {
    var eventInvites: FetchEventInvitesService { get }
}

protocol HasEventInvitesService {
    var eventInvite: EventInvitesService { get }
}

/// Container for the services required by the account view model logic container.
class EventInvitesViewModelServices: HasFetchEventInvitesService, HasEventInvitesService {
    let eventInvites: FetchEventInvitesService
    let eventInvite: EventInvitesService
    
    init(eventInvites: FetchEventInvitesService = .init(), eventInvite: EventInvitesService = .init()) {
        self.eventInvites = eventInvites
        self.eventInvite = eventInvite
    }
}

/// Logic container for the event invites view.
class EventInvitesViewModel {
    typealias Services = HasFetchEventInvitesService & HasEventInvitesService
    
    /// Contains the required async operations
    let services: Services
    
    let trash = DisposeBag()
    
    let invites = PublishSubject<[EventInvite]>()
    
    init(services: Services = EventInvitesViewModelServices()) {
        self.services = services
    }
    
    func fetchInvites() {
        services.eventInvites.execute()
            .take(1)
            .bind(to: invites)
            .disposed(by: trash)
    }
    
    func accept(invite: EventInvite) -> Observable<Bool> {
        return services.eventInvite.accept(inviteId: invite.id)
    }
    
    func deny(invite: EventInvite) -> Observable<Bool> {
        return services.eventInvite.deny(inviteId: invite.id)
    }
}

/// Responsible for displaying the event invites view.
class EventInvitesViewController: UIViewController {
    
    enum EventInviteAction {
        case accept, deny
    }
    
    @IBOutlet weak var tableView: UITableView!
    
    let viewModel: EventInvitesViewModel
    
    let trash = DisposeBag()
    
    /// Constructor - Assigns the logic container and reads the visuals from the .nib.
    init(viewModel: EventInvitesViewModel = .init()) {
        self.viewModel = viewModel
        
        super.init(nibName: "EventInvitesViewController", bundle: nil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        set(title: "Invites")
        
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        
        viewModel.invites
            .bind(to: tableView.rx.items(cellIdentifier: "Cell")) { row, element, cell in
                cell.textLabel?.text = element.name
                cell.textLabel?.font = UIFont(name: "Helvetica Neue", size: 20)
                cell.backgroundColor = .clear
                
                let tap = UITapGestureRecognizer(target: nil, action: nil)
                tap.rx.event
                    .withLatestFrom(Observable.just(element))
                    .flatMap({ [weak self] in
                        self?.showInviteActions(for: $0) ?? .just(nil)
                    })
                    .filter({ $0 != nil })
                    .withLatestFrom(Observable.just(element)) { ($0!, $1) }
                    .flatMap({ [weak self] (action: EventInviteAction, invite: EventInvite) -> Observable<Bool> in
                        
                        guard let self = self else { return .empty() }
                        switch action {
                        case .accept:
                            return self.viewModel.accept(invite: invite)
                        case .deny:
                            return self.viewModel.deny(invite: invite)
                        }
                    })
                    .subscribe(onNext: { [weak self] in
                        if $0 {
                            self?.navigationController?.popViewController(animated: true)
                        } else {
                            print("failure")
                        }
                    })
                    .disposed(by: self.trash)

                cell.addGestureRecognizer(tap)
                
            }.disposed(by: trash)
        
        viewModel.fetchInvites()
    }
    
    func showInviteActions(for invite: EventInvite) -> Observable<EventInviteAction?> {
        return Observable.create { observer in
            let alert = UIAlertController(title: "Event Invite", message: "\(invite.username) invited you to an event!", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "ignore", style: .cancel, handler: { _ in
                observer.onNext(nil)
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "deny", style: .destructive, handler: { _ in
                observer.onNext(.deny)
                observer.onCompleted()
            }))
            alert.addAction(UIAlertAction(title: "accept", style: .default, handler: { _ in
                observer.onNext(.accept)
                observer.onCompleted()
            }))
            self.present(alert, animated: true, completion: nil)
            return Disposables.create {
                alert.dismiss(animated: true, completion: nil)
            }
        }
    }
}
