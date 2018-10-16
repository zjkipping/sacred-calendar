//
//  ViewController.swift
//  SacredCalendar
//
//  Created by Developer on 9/19/18.
//  Copyright © 2018 CS4320. All rights reserved.
//

import UIKit

class LoginViewController: UIViewController {
    
    @IBOutlet weak var usernameField: UITextField!
    @IBOutlet weak var passwordField: UITextField!
    
    var username: String {
        return usernameField.text ?? ""
    }
    
    var password: String {
        return passwordField.text ?? ""
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    @IBAction func loginPressed(sender: Any) {
        let credentials = [
            "username" : username,
            "password" : password,
        ]
        
        _ = API.request(.auth, .login, credentials, callback: { response in
        
            guard response.success else {
                // error handling
                return
            }
            
            guard let user = User(json: response.data) else {
                // error handling
                return
            }
            
            print("logged in: \(user.fullName)")
            
            let events = EventsViewController()
            self.navigationController?.pushViewController(events, animated: true)
        })
    }
    
}
